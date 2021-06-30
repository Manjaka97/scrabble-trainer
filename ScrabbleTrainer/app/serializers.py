# This class contains all serializers, which are nothing more but
# Python classes from rest_frameworks to convert Python database models into JSON,
# which unlike python classes can be used by pretty much anything, including our react web-client
from rest_framework import serializers


class DictionarySerializer(serializers.Serializer):
    letters = serializers.CharField(max_length=7)
    dictionary = serializers.DictField()


class LetterSetSerializer(serializers.Serializer):
    letters = serializers.CharField(max_length=7)
    score = serializers.IntegerField()
    progress = serializers.IntegerField()
    found = serializers.DictField()

    class meta:
        abstract = True


class UserSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    sets = LetterSetSerializer(many=True) # Don't forget many=True when it is a list