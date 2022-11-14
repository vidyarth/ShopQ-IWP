const wrapper = document.querySelector(".wrapper");
btn1=wrapper.querySelector(".form button");
qrin=wrapper.querySelector(".form input");
qrim=wrapper.querySelector(".qr-img");

btn1.addEventListener("click",() => {
    console.log("entered");
    let qrinv = qrin.value;
    if(!qrinv) return;
    console.log(qrinv);
    wrapper.classList.add("active");
    qrim.src= `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${qrinv}`;
    document.getElementById("down").style.visibility="visible";
} )

function generatePDF()
{
    var options = {orientation: 'p', unit: 'mm', format: 'a4'};
    var doc = new jsPDF(options);
    var img = new Image();
    img.src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${qrin.value}`;
    doc.setFontSize(15);
    doc.text(30, 20, '   Scan This QR Code to Order from the shop on ShopQ!!');
    doc.addImage(img, 'JPEG', 50, 50, 100, 100);
    doc.save('qr.pdf');
}