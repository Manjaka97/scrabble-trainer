# The power of Django. Here a python class is defined for each MONGODB document,
# so that they can be manipulated (CRUD) as python objects, using familiar python methods.
# Because of this, we are able to use MongoDB without even having to know NoSQL syntax.
from djongo import models

# Create your models here.
class Dictionary(models.Model):
    letters = models.CharField(max_length=7, primary_key=True)
    dictionary = models.JSONField()

    def __str__(self) -> str:
        return self.letters


class LetterSet(models.Model):
    letters = models.CharField(max_length=7)
    score = models.IntegerField()
    progress = models.IntegerField()
    found = models.JSONField()

    objects = models.DjongoManager()

    class Meta:
        abstract = True

class User(models.Model):
    username = models.CharField(max_length=150, unique=True)
    sets = models.ArrayField(model_container=LetterSet)

    objects = models.DjongoManager()

    def __str__(self) -> str:
        return self.username