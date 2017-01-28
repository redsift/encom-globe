const Colors = {
    Markers: '#ffcc00'
};

export const Render = {
    PixelRatio: window.devicePixelRatio
};

export const Labels = {
    TextFont: 'Raleway',
    TextColor: '#fff',
    TextSize: 30,    
    TextPaddingX: 10,
    TextPaddingY: 10,
    TextStrokeStyle: '#000',
    TextStrokeWidth: 6,  
    UnderlineWidth: 4,
    UnderlineOffset: 4,
    UnderlineColor: Colors.Markers,
    UnderlineCap: 'square',
    BackgroundFillStyle: '#eee'
};

export const Markers = {
    Color: Colors.Markers,
    Opacity: 0.85,
    Canvas: 32, // show be a pow(2) and large enough for the below
    StrokeOuter: 3,
    RadiusInner: 7,
    RadiusOuter: 11
}

export const Smoke = {
    Color: '#aaa',
    Count: 5000,
    PerPin: 30,
    PerSecond: 20
};
