# 3.8 alpine doesn't work because ujson does not have wheels, and gcc (to build the wheel) isn't in alpine
FROM python:3.8

COPY ./requirements.txt .
RUN pip install -r requirements.txt
RUN pip install ujson==4.0.2 --no-cache --no-binary :all:
COPY . ./ScrabbleTrainer
WORKDIR /ScrabbleTrainer
RUN python manage.py collectstatic
