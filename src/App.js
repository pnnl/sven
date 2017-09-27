import React, { Component } from 'react';

import {Map, Set} from 'immutable';

import {scaleOrdinal, schemeCategory10} from 'd3-scale';
import {min, max} from 'd3-array';

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
        <ListItem button dense key={k} onClick={() => onClick(k, data.get(k))}>
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

class App extends Component {
  state = { people: employees.map(() => false) };

  handleEmployeeTypeClick = (k, v) => {
    this.setState({people: this.state.people.merge(v)});
  }

  handlePersonChange = value => {
    const selection =  Set(value.split(DELIIMTER));
    this.setState({
      people: this.state.people.map((_,k) => selection.has(k))
    });
  }

  handlePersonClick = values => {
    this.setState({
      people: this.state.people.merge(Map(values.map(d => [d.name, true])))
    });
  }

  render() {
    const {people} = this.state;

    const nFiltered = people.valueSeq()
      .reduce((v, sum) => v + sum, 0);

    const data = events
      .filter(d => nFiltered === 0 || people.get(d.name))
      .filter(d => d.date === '2014-01-18 00:00:00');

    const storylines = layout(data);
    const ymin = min(storylines.interactions, d => d.y0);
    const ymax = max(storylines.interactions, d => d.y1);
    
    return (
      <Grid container>
        <Grid item xs={12} sm={3}>
          <Card>
            <CardHeader title='Dates' subheader='click to include data from one or more days'/>
            <CardContent>
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
              height={10*(ymax - ymin)}
              color={d => color(employeesData[d.values[0].data.name])}
              lineLabel={d => d.values[0].data.name}
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
