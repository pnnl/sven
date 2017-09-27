import React, { Component } from 'react';

import {Map} from 'immutable';

import {scaleOrdinal, schemeCategory10} from 'd3-scale';

import Avatar from 'material-ui/Avatar';
import Grid from 'material-ui/Grid';
import Paper from 'material-ui/Paper';
import List, {ListSubheader, ListItem, ListItemText} from 'material-ui/List';
import Checkbox from 'material-ui/Checkbox';

import Select from 'react-select-2';
import 'react-select-2/dist/css/react-select-2.css';

import SvenLayout from './sven-layout';
import StorylineChart from './StorylineChart';

import events from './data/events.json';
import employeesData from './data/employees.json';

const layout = SvenLayout()
  .time(d => d.hour)
  .id(d => d.name)
  .group(d => d.activity);

const color = scaleOrdinal(schemeCategory10);

const employees = Map().withMutations(employees =>
  Map(employeesData).map((v,k) => employees.setIn([v,k], true))
);

const EmployeeList = ({data, onClick}) =>
  <Paper>
    <List>
      { data.keySeq().sort().map(k =>
          <ListItem button dense key={k} onClick={onClick(k, data.get(k))}>
            <Avatar style={{backgroundColor: color(k)}}>
              {data.get(k).size}
            </Avatar>
            <ListItemText primary={k}/>
          </ListItem>
        )
      }
    </List>
  </Paper>

const PersonSelect = ({data}) =>
  <div/>

class App extends Component {
  state = {
  };

  handleEmployeeClick = k => () => {
  }

  render() {
    const {employeeTypeFilter, activitiesFilter} = this.state;

    const data = events
      // .filter(d => employeeTypeFilter.get(employees[d.name]))
      .filter(d => d.date === '2014-01-18 00:00:00');

    return (
      <Grid container>
        <Grid item xs={12} sm={3}>
          <EmployeeList data={employees} onClick={this.handleEmployeeClick}/>
        </Grid>

        <Grid item xs={12} sm={9}>
          <Paper>
            <StorylineChart data={layout(data)}/>
          </Paper>
        </Grid>

      </Grid>
    );
	}
}

export default App;
