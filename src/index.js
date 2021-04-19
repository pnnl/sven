import {min, max} from 'd3-array'

import SvenLayout from './sven-layout'
import StorylineChartBase from './StorylineChart'

export const StorylineChart = ({data, group='group', id='id', time='time', color={}, lineLabel, ...props}) => {
  const storylines = SvenLayout()
  	.group(d => d[group])
  	.id(d => d[id])
  	.time(d => d[time])
  	(data);

  const ymin = min(storylines.interactions, d => d.y0);
  const ymax = max(storylines.interactions, d => d.y1);

  const createHandler = dict =>
  	dict
  		? ({key}) => dict[key] || key
  		: undefined;

  const handleGroupLabel = d =>
  	d[group];

  return <div style={{width: '100%'}}>
	  <StorylineChartBase
	    data={storylines}
	    height={Math.max(10*(ymax - ymin), 50)}
      color={createHandler(color)}
      lineLabel={createHandler(lineLabel, true)}
      groupLabel={handleGroupLabel}
	    {...props}
	  />	
	</div>
}
