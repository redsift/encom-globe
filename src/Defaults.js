const Colors = {
    Markers: '#ffcc00',
    Pins: '#8fd8d8',
    Background: '#000',
    Label: '#fff',
    Trail: '#eee',
    _Highlight: '#ff0000'
};

export const Render = {
    PixelRatio: window.devicePixelRatio
};

export const Lines = {
    Canvas: 128,
    Color: Colors.Markers,
    Segments: 256,
    Opacity: 0.7,
    Width: 6,
    Draw_MS: 5000, // bounces in after text
    DotWiggle: 0 // how much the dotted line should wiggle from the solid   
};

export const Labels = {
    TextFont: 'Raleway',
    TextColor: Colors.Label,
    TextSize: 30,    
    TextPaddingX: 10,
    TextPaddingY: 10,
    TextStrokeStyle: Colors.Background,
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
    Scale_MS: 2000
}

export const Pins = {
    Color: Colors.Pins,
    Canvas: 32,
    TextSize: 18, 
    Fade_MS: 500,   
    RadiusOuter: 7,    
    Draw_MS: 2000 // bounces in 
}

export const Smoke = {
    Color: Colors.Trail,
    Count: 5000,
    PerPin: 30,
    PerSecond: 20
};

export const View = {
    Color: Colors.Background
};
