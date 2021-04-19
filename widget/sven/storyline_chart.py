import ipywidgets as widgets
from traitlets import Unicode

from .react_jupyter_widget import ReactJupyterWidget

@widgets.register
class StorylineChart(ReactJupyterWidget):
    def __init__(self, data, **kwargs):
        super().__init__(
            data=data.to_dict(orient='records'),
            **kwargs
        )
