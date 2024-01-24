var debug = true;

function Logger(string){
    if(debug){
        console.log(string);
    }
}

function round(value, dez) {
    value = parseFloat(value);
    if (!value) return 0;
    dez = parseInt(dez);
    if (!dez) dez = 0;
    var factor = Math.pow(10, dez);
    return Math.round(value * factor) / factor;
}

function converter(value) {

    var calc_value = 0;

    switch (value) {
        //Singlefields
        case '20': calc_value = 20; break;
        case '19': calc_value = 19; break;
        case '18': calc_value = 18; break;
        case '17': calc_value = 17; break;
        case '16': calc_value = 16; break;
        case '15': calc_value = 15; break;
        case '14': calc_value = 14; break;
        case '13': calc_value = 13; break;
        case '12': calc_value = 12; break;
        case '11': calc_value = 11; break;
        case '10': calc_value = 10; break;
        case '9': calc_value = 9; break;
        case '8': calc_value = 8; break;
        case '7': calc_value = 7; break;
        case '6': calc_value = 6; break;
        case '5': calc_value = 5; break;
        case '4': calc_value = 4; break;
        case '3': calc_value = 3; break;
        case '2': calc_value = 2; break;
        case '1': calc_value = 1; break;
        //Doubles
        case 'D20': calc_value = 40; break;
        case 'D19': calc_value = 38; break;
        case 'D18': calc_value = 36; break;
        case 'D17': calc_value = 34; break;
        case 'D16': calc_value = 32; break;
        case 'D15': calc_value = 30; break;
        case 'D14': calc_value = 28; break;
        case 'D13': calc_value = 26; break;
        case 'D12': calc_value = 24; break;
        case 'D11': calc_value = 22; break;
        case 'D10': calc_value = 20; break;
        case 'D9': calc_value = 18; break;
        case 'D8': calc_value = 16; break;
        case 'D7': calc_value = 14; break;
        case 'D6': calc_value = 12; break;
        case 'D5': calc_value = 10; break;
        case 'D4': calc_value = 8; break;
        case 'D3': calc_value = 6; break;
        case 'D2': calc_value = 4; break;
        case 'D1': calc_value = 2; break;
        //Triples
        case 'T20': calc_value = 60; break;
        case 'T19': calc_value = 57; break;
        case 'T18': calc_value = 54; break;
        case 'T17': calc_value = 51; break;
        case 'T16': calc_value = 48; break;
        case 'T15': calc_value = 45; break;
        case 'T14': calc_value = 42; break;
        case 'T13': calc_value = 39; break;
        case 'T12': calc_value = 36; break;
        case 'T11': calc_value = 33; break;
        case 'T10': calc_value = 30; break;
        case 'T9': calc_value = 27; break;
        case 'T8': calc_value = 24; break;
        case 'T7': calc_value = 21; break;
        case 'T6': calc_value = 18; break;
        case 'T5': calc_value = 15; break;
        case 'T4': calc_value = 12; break;
        case 'T3': calc_value = 9; break;
        case 'T2': calc_value = 6; break;
        case 'T1': calc_value = 3; break;
        //Specials  
        case 'SB': calc_value = 25; break;
        case 'DB': calc_value = 50; break;
        case 'OUT': calc_value = 0; break;
        default: calc_value = 0; break;
    }

    return calc_value;
}

function parseBool(str) {

    if (str.length == null) {
      return str == 1 ? true : false;
    } else {
      return str == "true" ? true : false;
    }
  
  }

function SetDartIcons(DartsInHand) {
    if (DartsInHand == 1) {
        setImageVisible('dart1', true);
        setImageVisible('dart2', false);
        setImageVisible('dart3', false);
    } else if (DartsInHand == 2) {
        setImageVisible('dart1', true);
        setImageVisible('dart2', true);
        setImageVisible('dart3', false);
    } else if (DartsInHand >= 3) {
        setImageVisible('dart1', true);
        setImageVisible('dart2', true);
        setImageVisible('dart3', true);
    }
}

function setImageVisible(id, visible) {
    var img = document.getElementById(id);
    img.style.visibility = (visible ? 'visible' : 'hidden');
}

function copyText(textToCopy){
    this.copied = false;
    
    // Create textarea element
    const textarea = document.createElement('textarea');
    
    // Set the value of the text
    textarea.value = textToCopy;
    
    // Make sure we cant change the text of the textarea
    textarea.setAttribute('readonly', '');
    
    // Hide the textarea off the screnn
    textarea.style.position = 'absolute';
    textarea.style.left = '-9999px';
    
    // Add the textarea to the page
    document.body.appendChild(textarea);
  
    // Copy the textarea
    textarea.select();
  
    try {
      var successful = document.execCommand('copy');
      this.copied = true;
    } catch(err) {
      notify("error", "Information", err);
      this.copied = false;
    }
  
    textarea.remove();

    return this.copied;
}

//No Pinch2Zoom, no doubletapping to zoom
function touchHandler(event){
    if(event.touches.length > 1){
        //the event is multi-touch
        //you can then prevent the behavior
        event.preventDefault()
    }
}

//Nicht getestet
$('.no-zoom').bind('touchend', function(e) {
    e.preventDefault();
    // Add your code here. 
    $(this).click();
    // This line still calls the standard click event, in case the user needs to interact with the element that is being clicked on, but still avoids zooming in cases of double clicking.
  })
