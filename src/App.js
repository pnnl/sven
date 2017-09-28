import React, { Component } from 'react';

import {Map, Set} from 'immutable';

import {scaleOrdinal, schemeCategory10} from 'd3-scale';
import {min, max} from 'd3-array';
import {timeFormat} from 'd3-time-format';

import Typography from 'material-ui/Typography';
import Avatar from 'material-ui/Avatar';
import Grid from 'material-ui/Grid';
import Paper from 'material-ui/Paper';
import List, {ListSubheader, ListItem, ListItemText} from 'material-ui/List';
import Checkbox from 'material-ui/Checkbox';
import Card, {CardHeader, CardContent} from 'material-ui/Card';

import Select from 'react-select-2';
import 'react-select-2/dist/css/react-select-2.css';

import SvenLayout from './sven-layout';
import StorylineChart from './StorylineChart';

import events from './data/events.json';
import employeesData from './data/employees.json';

import './App.css';

const layout = SvenLayout()
  .time(d => d.hour)
  .id(d => String([d.name, d.date]))
  .group(d => d.activity);

const color = scaleOrdinal(schemeCategory10);

const employees = Map(employeesData);

const employeesByType = Map().withMutations(map =>
  employees.map((v,k) => map.setIn([v,k], true))
);

const EmployeeList = ({data, onClick}) =>
  <List>
    { data.keySeq().sort().map(k =>
        <ListItem button dense key={k} onClick={e => onClick(k, data.get(k), e.shiftKey)}>
          <Avatar style={{backgroundColor: color(k)}}>
            {data.get(k).size}
          </Avatar>
          <ListItemText primary={k}/>
        </ListItem>
      )
    }
  </List>

const asSelectList = map =>
  map.keySeq()
    .sort()
    .map(value => ({value, label: value}))
    .toArray();

const DELIIMTER = ';';

const PersonSelect = ({data, onChange}) =>
  <Select simpleValue multi delimiter={DELIIMTER}
    options={asSelectList(data.filter(v => !v))}
    value={asSelectList(data.filter(v => v))}
    onChange={onChange}
  />

const fmt = timeFormat('%a');
const weekdayLetter = d => fmt(new Date(d))[0];

const DatesSelect = ({data, onChange}) =>
  <div className='dates-component noselect'>
    { data.keySeq().sort().map(k =>
        <div
          key={k}
          onClick={e => onChange(k, !data.get(k), e.shiftKey)}
          className={'date' + (data.get(k) ? ' selected' : '')}
        >
          { weekdayLetter(k) }
        </div>
      )
    }
  </div>

const dates = Map(events.map(d => [d.date, false]));

class App extends Component {
  state = {
    people: employees.map(() => false),
    dates: dates.set(dates.keySeq().sort().first(), true)
  };

  handleEmployeeTypeClick = (k, v, append) => {
    if (append) {
      this.setState({people: this.state.people.merge(v)});
    } else {
      this.setState({people: this.state.people.map((_,k) => v.has(k))});
    }
  }

  handlePersonChange = value => {
    const selection =  Set(value.split(DELIIMTER));
    this.setState({
      people: this.state.people.map((_,k) => selection.has(k))
    });
  }

  handlePersonClick = values => {
    const selection = Set(values.map(d => d.name));
    this.setState({
      people: this.state.people.map((v, k) => selection.has(k))
    });
  }

  handleDateChage = (k, v, append) => {
    this.setState({
      dates: append
        ? this.state.dates.set(k, v)
        : this.state.dates.map((_,k2) => k === k2)
    });
  }

  render() {
    const {people, dates} = this.state;

    const nFiltered = people.valueSeq()
      .reduce((v, sum) => v + sum, 0);

    const data = events
      .filter(d => nFiltered === 0 || people.get(d.name))
      .filter(d => dates.get(d.date));

    const storylines = layout(data);
    const ymin = min(storylines.interactions, d => d.y0);
    const ymax = max(storylines.interactions, d => d.y1);

    const titleFmt = timeFormat('%a, %b %d');
    
    return (
      <Grid container>
        <Grid item xs={12} sm={3}>
          <Card>
            <CardHeader title='Dates' subheader='click to include data from one or more days'/>
            <CardContent>
              <DatesSelect data={this.state.dates} onChange={this.handleDateChage}/>
            </CardContent>
          </Card>            

          <Card>
            <CardHeader title='Legend' subheader='click to add names to filter'/>
            <CardContent>
              <EmployeeList data={employeesByType} onClick={this.handleEmployeeTypeClick}/>
            </CardContent>
          </Card>

          <Card>
            <CardHeader title='Filter by name' subheader='show specific people only'/>
            <CardContent>
              <PersonSelect data={people} onChange={this.handlePersonChange}/>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={9}>
          <Paper>
            <StorylineChart
              data={storylines}
              height={10*(ymax - ymin) || 100}
              color={d => color(employeesData[d.values[0].data.name])}
              lineLabel={d => d.values[0].data.name}
              lineTitle={d => titleFmt(new Date(d.values[0].data.date))}
              groupLabel={d => d.activity}
              onClick={this.handlePersonClick}
            />
          </Paper>
        </Grid>

      </Grid>
    );
	}
}

export default App;
