
document.addEventListener("DOMContentLoaded", function(){
    document.querySelector(".columns").scrollIntoView({ behavior: 'auto' });
});
function formatInputValue() {
    var input = document.getElementById("qty");
    var value = input.value;
    
    // If value is not a number or is less than 1, set it to 1
    if (isNaN(value) || value < 1) {
      value = 1;
    }
    
    // Pad the value with leading zeros if necessary
    value = value.toString().padStart(2, "0");
    
    // Update the input value
    input.value = value;
}
formatInputValue();
