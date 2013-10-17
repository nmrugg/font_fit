var FONT_FIT = function create_font_fit(style)
{
    "use strict";
    
    var body = document.body,
        el = document.createElement("fontSizeTester"),
        cur_styles,
        obj,
        tries;
    
    /// Make sure the element won't be visible. Although, since it removes itself immediately, you won't anyway.
    el.style.visibility = "hidden";
    el.style.pointerEvents = "none";
    el.style.display = "inline";
    
    if (style) {
        ///TODO: Make a more cross browser version.
        Object.keys(style).forEach(function (key)
        {
            el.style[key] = style[key];
        });
    }
    
    function get_optimal_size(size, fit_to, careful, dir)
    {
        var actual_w,
            actual_h,
            ratio,
            w_off,
            h_off,
            new_size;
        
        el.style.fontSize = size + "px";
        
        actual_w = el.offsetWidth;
        actual_h = el.offsetHeight;
        
        w_off = actual_w - fit_to.w ;
        h_off = actual_h - fit_to.h;
        
        /// Is it just right or is it small enough and it already tried a bigger size?
        if ((w_off === 0 && h_off === 0) || (w_off <= 0 && h_off <= 0 && dir === "smaller")) {
            return size;
        }
        
        /// Can we get bigger and need to?
        if (dir !== "smaller" && w_off < 0 && h_off < 0) {
            dir = "bigger";
            /// Is the width the least off?
            if (w_off > h_off) {
                ratio = fit_to.w / actual_w;
            } else {
                ratio = fit_to.h / actual_h;
            }
        } else {
            dir = "smaller";
            /// Is the width the most off?
            if (w_off > h_off) {
                ratio = fit_to.w / actual_w;
            } else {
                ratio = fit_to.h / actual_h;
            }
        }
        
        tries += 1;
        if (tries > 1000) {
            throw "Can't fit the font!";
        }
        
        /// Make sure to round down.
        if (careful) {
            new_size = Math.floor(size * ((ratio + 1) / 2));
        } else {
            new_size = Math.floor(size * ratio);
        }
        
        /// Did the size not change?
        if (new_size === size) {
            return size;
        }
        
        /// Try again with a different size.
        return get_optimal_size(new_size, fit_to, careful, dir);
    }
    
    obj = {
        destory: function destory()
        {
            el  = null;
            obj = null;
        },
        fit: function fit(text, fit_to)
        {
            var res;
            
            if (!fit_to) {
                fit_to = {w: window.innerWidth, h: window.innerHeight};
            } else if (isNaN(fit_to.w) || isNaN(fit_to.h)) {
                throw "I need a number to fit the font!";
            }
            
            el.textContent = text;
            
            body.appendChild(el);
            
            /// Are there spaces? Text with spaces need to be treated more carefully.
            if (text.indexOf(" ") > -1) {
                tries = 0;
                el.style.whiteSpace = "normal";
                res = get_optimal_size(fit_to.w * text.length, fit_to, true);
            } else {
                tries = 0;
                el.style.whiteSpace = "nowrap"; /// Word wrapping causes unpredictable behavior.
                res = get_optimal_size(Math.floor(fit_to.w / text.length), fit_to);
            }
            
            body.removeChild(el);
            
            return res;
        }
    };
    
    return obj;
}
