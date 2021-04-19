import React from 'react';

import {StorylineChart} from '..'

import props from './data/props.json'

export default {
  title: 'Storyline',
  component: StorylineChart,
};

export const Default = () =>
  <StorylineChart {...props} />

export const WithoutColor = () =>
  <StorylineChart {...props} color={undefined} />

export const WithWidth = () =>
  <StorylineChart {...props} width={300} />
