# Dead Reckoning — Oyun tasarımı

## Oyuncu akışı

Her vakada sıradaki görev ana ekranda yer alır. Oyuncu önce illüstrasyondaki dört noktayı araştırır. Bulduğu delil, karakter portresinin yanındaki konuşma alanında görünür ve delil çantasına eklenir. Önceden bulunan delile çantadan tekrar ulaşılabilir.

Dört delil haritayı açar. İki hazır test, zaman çizelgesini olay anına taşır. Oyuncu çizelgeyi kendi başına sürükleyebilir veya canlandırabilir. İki test de yapıldığında tek bir alibi kararı sorulur. Uyuşmayan bir cevapta oyuncu haritaya dönebilir. Doğru karar bir sonraki bölümü açar.

## Bölümler

| Vaka | Olay sahnesi | Haritada sınanan |
| --- | --- | --- |
| Karşı Kıyı · Lizbon | Tagus kıyısındaki iskele ofisi | Vapurun kalkışı ve görüntüdeki saatin kaynağı |
| Yanlış İskele · New York | East River kıyısındaki güvenlik kulübesi | Kameranın kayıtlı konumu ve yolculuk süresi |
| Yeraltındaki İz · Tokyo | Ginza metro personel koridoru | Trenin konumu, olay saati ve anahtar zimmeti |
| Ortak Dakika · Final | Dünya haritası ve ortak olay panosu | Üç yerel saatin UTC eşlemesi ve ortak imza |

## Görsel ve işitsel kimlik

Ada Demir soruşturmanın bir sonraki adımını söyler. Çavuş Elias Grant harita aşamasında rehberlik eder. Maskeli kişinin mesajı finalde belirir. Yağmurlu kıyı ve metro sahnelerinde kan izleri, güvenlik kamerası, fişler ve defterler görülür. Bunlar özgün kurgusal illüstrasyonlardır.

Dört akor üzerine kurulu müzik, düşük frekanslı vuruşlar ve değişen üst notalar kullanır. Delil bulunduğunda, test bitirildiğinde ve yanlış cevap verildiğinde ayrı ses duyulur. Üst menüden ses kapatılabilir. Oyunun bütün gerekli bilgilendirmeleri ekranda yazılıdır.

## Teknik düzen

- `index.html` ana sayfa ve dosya yükleme sırası.
- `style.css` tema, mobil düzen ve dekoratif görseller.
- `cases.js` vaka verileri, kimlikler, coğrafi koordinatlar ve zamanlar.
- `turkish.js` Türkçe metin ve sahne içi delil konumları.
- `world.js` şematik kıyı geometrileri.
- `game.js` oyun akışı, çizim, ses, süre ve ilerleme kaydı.

Vaka süreli olmak zorunda değildir. Süresi dolan oyuncu delillerini koruyarak süresiz devam edebilir. GitHub Pages sürümü, klasör yapısı korunarak yayımlanır.

## Hareketli harita ekranı

Şehir görseli ve bölüm başlığı üstte, canlı harita ile testler aynı çalışma alanında görünür. Sıradaki test renk ve simgeyle belirtilir. Bir test başlatıldığında saat birkaç oyun dakikası ilerler, araç rotada konum değiştirir ve sonuç oynatım bitince açılır. Mobilde harita ile test paneli alt alta gelir. Hareketi azalt tercihi olan tarayıcılarda geçişler kapalıdır ve test sonucu doğrudan gösterilir.
