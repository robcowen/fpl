from flask_wtf import FlaskForm
from wtforms import StringField, SubmitField
from wtforms.validators import DataRequired

# class LeagueInputForm(FlaskForm):
#     league_id = StringField('League ID', validators=[DataRequired()], description="Enter your league id")
#     submit = SubmitField('Generate')
