
document.addEventListener("DOMContentLoaded", function(){
    let productAddForm = document.querySelector(".product-add-form");
    document.querySelector(".columns").scrollIntoView({ behavior: 'auto' });
});
function formatInputValue() {
    var input = document.getElementById("qty");
    var value = input.value.toString().padStart(2, "0");
    input.value = value;
}
formatInputValue();