from app import app
import requests
from pprint import pprint
from flask import render_template, redirect, url_for
from app.forms import *
import random
import pendulum

@app.route('/', methods=["GET","POST"])
def index():
    form = LeagueInputForm()
    if form.validate_on_submit():
        return redirect(url_for("main", league_id=form.league_id.data))

    return render_template('index.html', form=form)

@app.route('/<league_id>', methods=["GET"])
def main(league_id):
    # Query league for list of entries
    url = "https://fantasy.premierleague.com/api/leagues-classic/"+str(league_id)+"/standings/"

    response = requests.get(url)

    if response.raise_for_status():
        abort(response.status_code)

    response = response.json()

    last_updated_data = pendulum.parse(response['last_updated_data']).format('LLL')
    league_name = response['league']['name']

    colours = ['#ff0000', '#ff8000', '#00ff00', '#0080ff', '#8000ff', '#0000ff', '#ff00ff', '#ff0080', '#ffff00', '#00ff80']

    datasets = []
    i = 0
    for result in response['standings']['results']:

        data = {}
        data['label'] = result['player_name']
        data['data'] = []
        if i < len(colours):
            data['borderColor'] = colours[i]

        else:
            data['borderColor'] = ["#"+''.join([random.choice('ABCDEF0123456789') for i in range(6)])]

        # Make API query for each entry
        url = "https://fantasy.premierleague.com/api/entry/"+str(result['entry'])+"/history/"

        response = requests.get(url)

        if response.raise_for_status():
            abort(response.status_code)

        response = response.json()

        # Loop through gameweeks and collect data
        for gameweek in response['current']:
            data_point = {
                'x': gameweek['event'],
                'y': gameweek['total_points']
            }

            data['data'].append(data_point)

        datasets.append(data)
        i = i + 1

    # Create gameweek labels to end of season
    labels = list(range(1, 39))

    return render_template('main.html', league_name = league_name, last_updated_data = last_updated_data, datasets = datasets, labels = labels)
