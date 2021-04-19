import React, {Component} from 'react'
import {render} from 'react-dom'

import {Example} from '../../src'

class Demo extends Component {
  render() {
    return <div>
      <h1>sven Demo</h1>
      <div>
        A Jupyter widget for storyline visualizatition
      </div>
      <Example hello='world'/>
    </div>
  }
}

render(<Demo/>, document.querySelector('#demo'))
