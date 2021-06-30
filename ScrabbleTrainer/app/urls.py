from django.urls import path
from app import views

# Calls the provided method (defined in views.py) for each url pattern in path method
# Each method from views.py is already set up to return an http api response, thanks to rest_framework
urlpatterns = [
    path('', views.frontend),
    path('login', views.signin),
    path('logout', views.signout),
    path('register', views.signup),
    path('play', views.play),
    path('userInfo', views.userInfo),
    path('found', views.found),
    path('username', views.get_username),
    path('remove/<letters>', views.remove)
]