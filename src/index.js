/* 

  BSD License:

  SVEN: Storyline Visualization Library and Demonstration

  Copyright © 2021, Battelle Memorial Institute
  All rights reserved.

  1. Battelle Memorial Institute (hereinafter Battelle) hereby grants permission
     to any person or entity lawfully obtaining a copy of this software and
     associated documentation files (hereinafter “the Software”) to redistribute
     and use the Software in source and binary forms, with or without 
     modification.  Such person or entity may use, copy, modify, merge, publish,
     distribute, sublicense, and/or sell copies of the Software, and may permit
     others to do so, subject to the following conditions:

     * Redistributions of source code must retain the above copyright notice,
       this list of conditions and the following disclaimers.
     * Redistributions in binary form must reproduce the above copyright notice,
       this list of conditions and the following disclaimer in the documentation
       and/or other materials provided with the distribution.
     * Other than as used herein, neither the name Battelle Memorial Institute
       or Battelle may be used in any form whatsoever without the express
       written consent of Battelle. 

  2. THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
     AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
     THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
     PURPOSEARE DISCLAIMED. IN NO EVENT SHALL BATTELLE OR CONTRIBUTORS BE LIABLE
     FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
     DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
     SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
     CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
     LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY
     OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH
     DAMAGE.
     
*/

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
