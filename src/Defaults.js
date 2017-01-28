const Colors = {
    Markers: '#ffcc00',
    _Highlight: '#ff0000'
};

export const Render = {
    PixelRatio: window.devicePixelRatio
};

export const Lines = {
    Color: Colors.Markers,
    Segments: 150,
    Opacity: 0.7,
    Width: 10    
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
    BackgroundFillStyle: '#eee',
    Fade_MS: 2000
};

export const Markers = {
    Color: Colors.Markers,
    Opacity: 0.85,
    Canvas: 64, // show be a pow(2) and large enough for the below
    StrokeOuter: 3,
    RadiusInner: 14,
    RadiusOuter: 22,
    Delay_MS: Labels.Fade_MS, // bounces in after text
    Scale_MS: 2000
}

export const Smoke = {
    Color: '#aaa',
    Count: 5000,
    PerPin: 30,
    PerSecond: 20
};
