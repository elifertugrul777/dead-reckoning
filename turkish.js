/* Turkish case copy and investigation-scene positions. Geometry lives in cases.js. */
const turkishCases = [
  {
    city:'Lizbon', country:'Portekiz', label:'Karşı Kıyı', date:'14 TEMMUZ 2026', water:'TAGUS NEHRİ',
    intro:'Arşivci Inês Duarte limandaki ofisinde ölü bulundu. Mara Vale olay saatinde karşı kıyıda olduğunu söylüyor. Bunu doğrulayacak tek şey bir güvenlik görüntüsü.',
    hook:'Dedektif, önce iskele ofisini ara. Parlayan izlere dokun. Dört delil çıkmadan alibiye güvenme.',
    sites:['Cais do Sodré','Cacilhas','Liman ofisi'],
    ops:[
      ['🎫','Turnike fişi','22.12’de turnike, Mara Vale’i kuzey kıyısındaki Cais do Sodré’de kaydetti. Turnike saati, sefer kayıtlarıyla eşleşiyor.',14,74],
      ['📋','Vapur sefer kaydı','Turnike girişinden sonra ilk vapur 22.20’de kalkıyor, 22.30’da Cacilhas’a yanaşıyor.',65,63],
      ['📹','Güvenlik kamerası','Güney yakasındaki kameradan alınan görüntüde 22.17 yazıyor. Ama ham kaydın çekim zamanı dışa aktarılırken silinmiş.',14,13],
      ['🗂️','Arşiv kılavuzu','Arayüzdeki 22.17, görüntünün arşive alındığı saat. Bu alan çekim saati boşken de görünüyor.',87,54]
    ],
    tests:[
      ['Vapur 22.17’de neredeydi?','Vapur hâlâ ilk iskelede. Vale’in anlattığı sefer, 22.17’de karşı kıyıya ulaşamaz.'],
      ['Kameradaki 22.17 neyi gösteriyor?','22.17, görüntü aktarımının saati. Vale’in o anda güney kıyısında olduğunu kanıtlamıyor.']
    ],
    choices:['Kamera Vale’i 22.17’de karşı kıyıya yerleştiriyor.','Vapur saatleri ve görüntü birlikte alibiyi doğrulamıyor.','Turnike ile kamera aynı kıyıda.'],
    report:'Vale’in alibisi çöktü. Aynı arşiv şablonu New York’taki dosyada da var.',
    sync:['Kapı paneli kontrolü','Delil dizini değişikliği']
  },
  {
    city:'New York',country:'ABD',label:'Yanlış İskele',date:'15 TEMMUZ 2026',water:'EAST RIVER',
    intro:'Belgeselci Evan Price, Lizbon’daki kayıtları araştırırken öldürüldü. Dosyasındaki görüntüye DUMBO etiketi vurulmuş. Ancak kameranın kimlik numarası başka bir iskeleyi işaret ediyor.',
    hook:'Yağmur izlerin üstünü kapatmadan kulübeyi tara. Kamera kaydıyla vapur fişini bulmamız gerek.',
    sites:['Pier 11','DUMBO İskelesi','Brooklyn ofisi'],
    ops:[
      ['🖼️','DUMBO etiketli görüntü','17.12 tarihli görüntünün konum etiketi DUMBO. Güvenli kaynak kaydındaki cihaz numarası ER-11.',88,36],
      ['📹','Kamera sicili','ER-11, Manhattan tarafındaki Pier 11’e sabit. DUMBO’daki kamera ER-23.',93,66],
      ['🎫','Biniş fişi','17.15’te görevli, Vale’in Pier 11’den bindiğini doğruluyor. Vapur DUMBO’ya 17.24’te ulaştı.',72,55],
      ['🎙️','Tanık ifadesi','Vale, biniş fişindeki vapurdan DUMBO’da 17.16’da indiğini söylüyor.',38,60]
    ],
    tests:[
      ['Görüntü hangi kıyıdan?','ER-11 Manhattan’da. DUMBO etiketi dosyayı nehrin yanlış kıyısına koyuyor.'],
      ['Vapur 17.16’da neredeydi?','Vapur 17.16’da seyir hâlinde. Kayıtlı varış 17.24.']
    ],
    choices:['Kamera sicili ve vapur kaydı ifadeyle çelişiyor.','İki delil de Vale’i 17.12’de DUMBO’ya yerleştiriyor.','ER-11 iki kıyıda birden kayıtlı.'],
    report:'Konum etiketi değiştirilmiş. Orijinal görüntü ve vapur kaydı iki bağımsız kaynaktan geliyor.',
    sync:['Delil dizini değişikliği','Vapur listesinin yedeği']
  },
  {
    city:'Tokyo',country:'Japonya',label:'Yeraltındaki İz',date:'17 TEMMUZ 2026',water:'',
    intro:'Gazeteci Aiko Mori, orijinal görüntüleri istedikten birkaç saat sonra öldürüldü. Metro yolculuğuna ve arşiv dışında saklanan bir zimmet defterine dair not bırakmıştı.',
    hook:'Personel koridoruna geldik. Mori’nin bıraktığı kayıtları bul. Özellikle imza anahtarı defterini ara.',
    sites:['Ginza','Kyobashi','Nihombashi'],
    ops:[
      ['🚇','Ginza giriş kaydı','06.06’da kart Ginza turnikesinden geçti. Uygun tren 06.10’da kalkıyor ve Nihombashi’ye 06.17’de varıyor.',47,38],
      ['📝','Varış iddiası','Arşiv notu, aynı kartla yapılan Ginza Line yolculuğunun 06.09’da Nihombashi’de bittiğini söylüyor.',24,85],
      ['🔑','Anahtar zimmet defteri','MV-07 yalnızca Mara Vale’e zimmetli. RS-12 Ren Sato’nun, DO-04 Daniel Ortiz’in. Bu imzalı kopya olay ekibinde tutuluyor.',46,69],
      ['💾','Mori’nin mühürlü kaydı','Arşivde görünen kullanıcı adı değişebilir. Mori’nin mühürlü kopyasında işlemi imzalayan fiziksel anahtarın kodu duruyor.',13,28]
    ],
    tests:[
      ['Tren 06.09’da neredeydi?','İddia edilen varış saatinde tren Ginza’dan ayrılmamıştı.'],
      ['Arşiv işlemini kime bağlayabiliriz?','Ortak işlemdeki imza anahtarını bağımsız zimmet defteriyle eşleştirmeliyiz.']
    ],
    choices:['Tren saatleri ifadeyi doğruluyor.','Düzenlenebilir kullanıcı adı tek başına yeterli.','Yolculuk tamamlanamazdı. İşlemi kimin yaptığını imza anahtarı gösterebilir.'],
    report:'Zimmet defteri elimizde. Üç şehrin arşiv saatini tek bir zaman çizelgesinde eşleştir.',
    sync:['İstasyon görüntüsü aktarımı','Delil dizini değişikliği']
  }
];

for (const [i,city] of window.DR.cities.entries()) {
  const tr = turkishCases[i];
  for (const key of ['city','country','label','date','water','intro','hook','choices','report']) city[key] = tr[key];
  city.sites.forEach((site,j) => site[1] = tr.sites[j]);
  city.ops.forEach((op,j) => {
    [op.icon,op.name,op.body,op.x,op.y] = tr.ops[j];
  });
  city.tests.forEach((test,j) => [test.title,test.result] = tr.tests[j]);
  city.sync.forEach((record,j) => record.type = tr.sync[j]);
}
window.DR.people.forEach((person,i) => person.role = ['Arşiv denetçisi','Ulaşım danışmanı','Haber merkezi irtibatı'][i]);
