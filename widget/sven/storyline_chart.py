import ipywidgets as widgets
from traitlets import Unicode

from .react_jupyter_widget import ReactJupyterWidget

from matplotlib.cm import tab10
from matplotlib.colors import rgb2hex

@widgets.register
class StorylineChart(ReactJupyterWidget):
    def __init__(self, data, color='unique', cmap=tab10, **kwargs):

        ids = data[kwargs.get('id', 'id')].unique()

        if color == 'unique':
            color = {
                x: rgb2hex(cmap(i))
                for i, x in enumerate(ids)
            }

        super().__init__(
            data=data.to_dict(orient='records'),
            color=color,
            **kwargs
        )
