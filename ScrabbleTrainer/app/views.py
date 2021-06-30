from .models import * # The database models to be accessed (Python classes)
from .serializers import * # Converts the python models web-client friendly JSON
from rest_framework.response import Response # To send http response with more functionality
from rest_framework.decorators import api_view # Converts normal http response to api view
from django.shortcuts import render # For rendering templates (login page)
from django.contrib.auth import authenticate, login, logout # Authentication
from django.contrib.auth.models import User as AuthUser # Django user model for Authentication
from django.http import HttpResponseRedirect # For redirecting user after login and logout
from .scrabble import play as playScrabble # Logic to generate dictionary from letter set

# Redirects to the frontend home page
def frontend(request):
    return HttpResponseRedirect('https://scrabble.elvnosix.com') # Redirected to our react-app

# Signs user in using Django login() method
def signin(request):
    if request.method == 'GET':
        return render(request, './signin.html') # Django automatically looks for the template in the template folder
    if request.method == 'POST':
        username = str.lower(request.POST['username'])
        password = request.POST['password']
        user = authenticate(request=request, username=username, password=password) # Returns None if credentials fail
        if user is not None:
            login(request, user)
            return HttpResponseRedirect('https://scrabble.elvnosix.com') # Redirected to our react-app
        else:
            return render(request, './signin.html', {'failed': 'Wrong username or password'})

# Signs user out using Django logout() method
def signout(request):
    logout(request) # Does not return any error even if user wasn't logged in. Deletes all existing session data
    return HttpResponseRedirect('/login')

# Signs user up using Django AuthUser manager, then saves user in our database
def signup(request):
    if request.method == 'GET':
        return render(request, './signup.html') # Django automatically looks for the template in the template folder
    if request.method == 'POST':
        username = str.lower(request.POST['username'])
        if AuthUser.objects.filter(username=username): # If username already exists
            return render(request, './signup.html', {'failed': 'Username already taken'})
        
        password = request.POST['password']
        user = AuthUser.objects.create_user(username, password=password)
        user.save()
        u = User(username=username) # We also create a user document in our app user model
        u.save()
        login(request, user)
        return HttpResponseRedirect('/')

# Returns dictionary for letter set and creates entry for letter set in user info if logged in
@api_view(['GET'])
def play(request):
    # Ensuring that the request is valid
    if len(request.GET['letters']) != 7:
        return Response({'notFound': True})

    # Sorting the letter set to ensure that sets are always represented the same way
    letterSet = request.GET['letters']
    letterSet = ''.join(sorted(letterSet))
    
    if request.user.is_authenticated:
        # Returns the model instance from the database containing the dictionary for the set
        dictionary = playScrabble(letterSet, save=True) 
        username = request.user.username
        u = User.objects.filter(username=username)[0]
        # Create the sets if user has never played before
        if not u.sets:
            u.sets = []
        # Returns False if user has not played with this letter set before
        if not next((item for item in u.sets if item['letters'] == letterSet), False):
            # We create an entry for the letter set
            s = {'letters': letterSet, 'score': 0, 'progress': 0, 'found':{}}
            u.sets.append(s)
            u.save()
    else:
        # Returns the model instance from the database containing the dictionary for the set
        dictionary = playScrabble(letterSet, save=False) 
    data = DictionarySerializer(dictionary).data
    return Response(data)

# Returns information about logged in user
@api_view(['GET'])
def userInfo(request):
    if request.user.is_authenticated:
        data = UserSerializer(User.objects.filter(username=request.user.username)[0]).data
        return Response(data)
    else:
        return Response({'notFound':True})

# Returns username
@api_view(['GET'])
def get_username(request):
    if request.user.is_authenticated:
        return Response({'username':request.user.username})
    return Response({'username':None})

# Updates the list of found words for a letter set and returns the updated score
@api_view(['POST'])
def found(request):
    if request.user.is_authenticated:
        username = request.user.username
        letterSet = ''.join(sorted(request.POST['letterSet']))
        found = request.POST['found']
        user = User.objects.filter(username=username)[0]
        # Finding the letter set info (score and list of words found) in user sets
        s = next(item for item in user.sets if item['letters'] == letterSet)
        for i in range(len(user.sets)):  
            if user.sets[i]['letters'] == letterSet:
                # If word has not been found before, we add it in the list and update the score
                if found not in user.sets[i]['found']:
                    user.sets[i]['found'][found] = None
                    user.sets[i]['score'] += 1
                    user.sets[i]['progress'] = int(user.sets[i]['score'] * 100 / int(request.POST['total']))
                    user.save()
                break
        return Response({'score':user.sets[i]['score']})
    return Response({'score':0})

# Deletes a set from user records
@api_view(['DELETE'])
def remove(request, letters):
    if request.user.is_authenticated:
        letters = ''.join(sorted(letters))
        user = User.objects.filter(username=request.user.username)[0]
        # Finding the index of the set in sets array and popping it
        for i, s in enumerate(user.sets):
            if s['letters'] == letters:
                user.sets.pop(i)
                break
        user.save()
        return Response({'removed':True})
    return Response({'removed':False})