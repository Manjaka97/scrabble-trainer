from .models import Dictionary
from itertools import permutations
import ujson


def play(letterSet, save=True):
    # If we have seen the letter set before, we already have its dictionary in the database
    d = Dictionary.objects.filter(letters=letterSet)
    if d:
        return d[0]

    # Computing all permutations of the letter set
    words = set([])
    for i in range(2, len(letterSet)+1): # We start with permutations with length 2, as one letter words are not allowed in Scrabble
        for word in [''.join(p) for p in permutations(letterSet, i)]: # List of permutations of length i
            words.add(word)

    # Checking each word/permutation against the Global Dictionary (dictionary.json)
    file = open('app/dictionary.json', 'r')
    gDict = ujson.load(file)
    file.close()

    # Creating an entry in the database
    d = Dictionary(letters=letterSet)
    
    # Copying the word and its definition to the local dictionary for the set
    d.dictionary = {}
    for word in words:
        if word in gDict:
            d.dictionary[word] = gDict[word]
    # Saving the new local dictionary in the database
    if save:
        d.save()

    # Finally, we return the document with the local dictionary to the web-client to be used for the game
    return d