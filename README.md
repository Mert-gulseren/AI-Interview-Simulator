# AI Interview Simulator

**Yapay Zekâ Destekli Teknik Mülakat ve Kodlama Simülatörü**

AI Interview Simulator, yazılım alanında teknik mülakatlara hazırlanmak isteyen kullanıcılar için geliştirilmiş, yapay zekâ destekli bir web uygulamasıdır.

Uygulama, kullanıcının seçtiği yazılım geliştirme alanına göre teknik mülakat soruları oluşturur. Sorular önceden hazırlanmış sabit bir veritabanından alınmaz; yerel olarak çalışan yapay zekâ modeli tarafından dinamik olarak üretilir.

Proje, React ve TypeScript kullanılarak geliştirilen frontend ile Python ve FastAPI kullanılarak geliştirilen backend mimarisinden oluşmaktadır.

## 1. Projenin Amacı

Projenin temel amacı, yazılım geliştiricilerin teknik mülakatlara hazırlanmasını kolaylaştıran etkileşimli bir çalışma ortamı oluşturmaktır.

Geleneksel mülakat hazırlık platformlarında genellikle önceden hazırlanmış sorular bulunmaktadır. Bu projede ise Ollama üzerinden çalışan yapay zekâ modeli kullanılarak farklı teknik soruların otomatik oluşturulması hedeflenmiştir.

Kullanıcı, ilgilendiği yazılım alanını seçerek o alana yönelik sorular oluşturabilir.

## 2. Kullanılan Teknolojiler

| Katman | Teknoloji | Kullanım Amacı |
|---|---|---|
| Frontend | React | Kullanıcı arayüzü |
| Frontend | TypeScript | Tip güvenliği ve uygulama geliştirme |
| Frontend | Vite | Geliştirme ortamı |
| Backend | Python | Sunucu tarafı işlemler |
| Backend | FastAPI | REST API geliştirme |
| Backend | Uvicorn | Backend sunucusu |
| Yapay Zekâ | Ollama | Yerel yapay zekâ çalıştırma |
| AI Modeli | Qwen2.5-Coder:7B | Teknik soru üretimi |
| Veri İletişimi | HTTP / JSON | Frontend ve backend iletişimi |

## 3. Uygulamanın Özellikleri

### 3.1. Yazılım Alanı Seçimi

Kullanıcı aşağıdaki alanlardan birini seçebilir:

- Frontend Development
- Backend Development
- Python Development

Seçilen alan backend sistemine gönderilir ve soru üretiminde kullanılır.

### 3.2. Yapay Zekâ ile Soru Üretimi

Uygulama, kullanıcının seçtiği alana göre Ollama aracılığıyla yapay zekâ modelinden soru üretmesini ister.

Sorular backend içerisinde sabit olarak tutulmaz.

### 3.3. Teknik Soru Türleri

Sistem aşağıdaki soru türlerini destekleyecek şekilde tasarlanmıştır:

- Theory: Teknik bilgi ve kavram soruları
- Coding: Kod yazma soruları
- Multiple Choice: Çoktan seçmeli sorular
- Bug Fixing: Kod hatalarını tespit etme soruları

Üretilen soru türü modelin çıktısına bağlıdır. Her istekte bütün soru türlerinin oluşturulması garanti edilmez.

### 3.4. Dinamik Soru Gösterimi

Yapay zekâdan gelen soru bilgileri kullanıcı arayüzünde gösterilir.

Soru yanıtı aşağıdaki alanları içerebilir:

- `type`: Soru türü
- `question`: Soru metni
- `code_snippet`: Varsa ilgili kod
- `options`: Varsa çoktan seçmeli cevap seçenekleri

### 3.5. Yerel Yapay Zekâ Kullanımı

Projede ücretli bir bulut yapay zekâ API'si yerine Ollama kullanılmaktadır.

Bu sayede model bilgisayarda yerel olarak çalıştırılabilir ve soru üretimi için ücretli API anahtarına ihtiyaç duyulmaz.

Modelin indirilmesi için internet bağlantısı gerekir. Model indirildikten sonra soru üretimi yerel ortamda gerçekleştirilebilir.

## 4. Proje Mimarisi

Uygulama iki ana bölümden oluşmaktadır.

**Frontend**

Kullanıcının yazılım alanını seçtiği, soru üretme işlemini başlattığı ve oluşturulan soruları görüntülediği arayüzdür.

**Backend**

Frontend'den gelen istekleri karşılar, Ollama ile iletişim kurar ve yapay zekâ tarafından oluşturulan soru verilerini frontend'e iletir.

**Veri akışı:**

1. Kullanıcı frontend üzerinden yazılım alanını seçer.
2. Frontend, FastAPI backend'e HTTP POST isteği gönderir.
3. Backend, seçilen alana uygun bir prompt hazırlar.
4. Prompt, yerel Ollama servisine gönderilir.
5. Qwen2.5-Coder modeli soruyu üretir.
6. Backend, modelin çıktısını işler.
7. Soru bilgileri JSON formatında frontend'e iletilir.
8. Frontend, gelen soruyu kullanıcıya gösterir.

## 5. Proje Klasör Yapısı

```text
ai-interview-project/
│
├── backend/
│   ├── main.py
│   └── venv/              # Varsa yerel sanal ortam
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── index.css
│   │   └── main.tsx
│   ├── package.json
│   ├── package-lock.json
│   └── vite.config.ts
│
├── .gitignore
└── README.md
```

Not: `node_modules`, `venv`, `.env` ve önbellek dosyaları GitHub'a yüklenmez. Gerekli bağımlılıklar kurulum sırasında yeniden oluşturulur.

## 6. Kurulum Gereksinimleri

Projeyi çalıştırmak için bilgisayarda aşağıdaki yazılımların kurulu olması gerekir:

- Python 3.13 veya uyumlu bir sürüm
- Node.js ve npm
- Git (GitHub'dan klonlamak için)
- Ollama
- Qwen2.5-Coder:7B modeli
- VS Code veya başka bir kod editörü

Ollama modeli bilgisayarda yerel çalıştığı için yeterli RAM ve depolama alanı bulunmalıdır. Modelin performansı bilgisayarın donanımına göre değişebilir.

**Resmî indirme adresleri:**

- Python: https://www.python.org/downloads/
- Node.js: https://nodejs.org/
- Ollama: https://ollama.com/download
- Git: https://git-scm.com/downloads
- VS Code: https://code.visualstudio.com/

## 7. Projeyi Bilgisayara İndirme

Git kuruluysa terminalde aşağıdaki komut çalıştırılır:

```bash
git clone https://github.com/Mert-gulseren/AI-Interview-Simulator.git
```

Ardından proje klasörüne girilir:

```bash
cd AI-Interview-Simulator
```

Proje ZIP olarak indirildiyse arşiv çıkartılarak ana proje klasörü VS Code ile açılabilir.

## 8. Backend Kurulumu

Backend, Python ve FastAPI kullanılarak geliştirilmiştir.

### 8.1. Backend klasörüne girme

Projenin ana klasöründeyken:

```powershell
cd backend
```

### 8.2. Python sanal ortamı oluşturma

Windows PowerShell:

```powershell
python -m venv venv
```

### 8.3. Sanal ortamı etkinleştirme

```powershell
.\venv\Scripts\Activate.ps1
```

PowerShell güvenlik politikası nedeniyle hata oluşursa, yalnızca mevcut kullanıcı için aşağıdaki komut kullanılabilir:

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

Ardından sanal ortam etkinleştirme komutu tekrar çalıştırılır.

### 8.4. Python kütüphanelerini yükleme

```powershell
python -m pip install fastapi "uvicorn[standard]" requests
```

Backend kodunun kullandığı ek Python kütüphaneleri varsa bunların da kurulması gerekir.

### 8.5. Backend sunucusunu başlatma

```powershell
python -m uvicorn main:app --reload
```

Başarılı olduğunda backend aşağıdaki adreste çalışır:

http://127.0.0.1:8000

FastAPI API dokümantasyonu:

http://127.0.0.1:8000/docs

Backend terminali uygulama çalıştığı sürece açık tutulmalıdır.

## 9. Ollama Kurulumu

Projenin yapay zekâ özelliklerini kullanabilmek için Ollama kurulmalıdır.

### 9.1. Ollama'yı indirme

https://ollama.com/download

Windows sürümü indirilip kurulur.

### 9.2. Kurulumu kontrol etme

Yeni bir terminal açılarak:

```powershell
ollama --version
```

Komut çalışıyorsa Ollama kurulumu tamamlanmıştır.

### 9.3. Yapay zekâ modelini indirme

```powershell
ollama pull qwen2.5-coder:7b
```

Modelin indirilmesi internet bağlantısına ve bilgisayarın hızına bağlı olarak zaman alabilir.

### 9.4. Modeli kontrol etme

```powershell
ollama list
```

Listede `qwen2.5-coder:7b` görünmelidir.

### 9.5. Ollama servisini çalıştırma

Ollama masaüstü uygulaması zaten çalışıyorsa ayrıca servis başlatılması gerekmeyebilir.

Servis çalışmıyorsa:

```powershell
ollama serve
```

Ollama varsayılan olarak aşağıdaki adreste hizmet verir:

http://localhost:11434

Backend'in Ollama'ya bağlanabilmesi için bu servisin erişilebilir olması gerekir.

## 10. Frontend Kurulumu

Frontend, React, TypeScript ve Vite kullanılarak geliştirilmiştir.

Yeni bir VS Code terminali açılır.

Projenin ana klasöründen frontend klasörüne girilir:

```powershell
cd frontend
```

### 10.1. Bağımlılıkları yükleme

```powershell
npm install
```

Bu komut `package.json` dosyasında belirtilen paketleri yükler.

### 10.2. Frontend sunucusunu başlatma

```powershell
npm run dev
```

Başarılı olduğunda terminalde yerel geliştirme adresi gösterilir.

Varsayılan adres:

http://localhost:5173

Tarayıcıdan bu adres açılarak uygulama kullanılabilir.

## 11. Uygulamayı Çalıştırma Sırası

Uygulamanın sorunsuz çalışması için üç bileşenin hazır olması gerekir.

**1. Ollama**

Ollama servisinin çalıştığından ve modelin indirildiğinden emin olunmalıdır.

**2. Backend**

Backend klasöründe:

```powershell
.\venv\Scripts\Activate.ps1
python -m uvicorn main:app --reload
```

**3. Frontend**

Frontend klasöründe:

```powershell
npm run dev
```

Son olarak tarayıcıdan:

http://localhost:5173

adresi açılır.

## 12. API Kullanımı

Backend'de teknik soru oluşturmak için aşağıdaki endpoint kullanılmaktadır.

**Endpoint:**

```http
POST /generate-question
```

**Örnek istek:**

```json
{
  "role": "frontend developer"
}
```

**Örnek yanıt:**

```json
{
  "type": "theory",
  "question": "What is the difference between JavaScript and TypeScript?",
  "code_snippet": "",
  "options": []
}
```

Bu yanıt yalnızca örnektir. Gerçek sorular yapay zekâ tarafından dinamik olarak oluşturulur.

API, FastAPI Swagger arayüzü üzerinden de test edilebilir:

http://127.0.0.1:8000/docs

## 13. Sık Karşılaşılan Sorunlar

### npm komutu tanınmıyor

Node.js kurulumunun tamamlandığından emin olunmalı ve terminal yeniden açılmalıdır.

### uvicorn komutu tanınmıyor

Python sanal ortamı etkinleştirilmeli ve Uvicorn kurulmalıdır.

Alternatif çalıştırma komutu:

```powershell
python -m uvicorn main:app --reload
```

### Ollama bağlantı hatası

Ollama uygulamasının çalıştığı ve `localhost:11434` adresinin erişilebilir olduğu kontrol edilmelidir.

### Model bulunamadı

Aşağıdaki komutla model indirilmelidir:

```powershell
ollama pull qwen2.5-coder:7b
```

### Sorular geç oluşturuluyor

Model bilgisayarda yerel çalıştığından soru üretim süresi donanım özelliklerine bağlıdır. İlk istek, modelin belleğe yüklenmesi nedeniyle daha uzun sürebilir.

### Frontend backend'e bağlanamıyor

Backend sunucusunun çalıştığı ve `http://127.0.0.1:8000` adresinin erişilebilir olduğu kontrol edilmelidir.

## 14. Geliştirilmesi Planlanan Özellikler

Projenin ilerleyen sürümlerinde aşağıdaki özelliklerin eklenmesi planlanmaktadır:

- Kullanıcı cevaplarının yapay zekâ ile değerlendirilmesi
- Teknik kodlama soruları için gelişmiş kod editörü
- Çoktan seçmeli sorulara cevap verme
- Mülakat performansının puanlanması
- Kullanıcıya güçlü ve zayıf yönleri hakkında geri bildirim verilmesi
- Mülakat sonunda detaylı sonuç ekranı
- Kullanıcı performansının raporlanması

Bu özellikler geliştirme planını ifade etmektedir; mevcut sürümde tamamlanmış oldukları anlamına gelmez.

## 15. Proje Durumu

**Durum:** Geliştirme aşamasında

Mevcut geliştirme çalışmaları, yapay zekâ ile soru üretimi, backend API iletişimi ve oluşturulan soruların frontend üzerinde görüntülenmesi üzerine yoğunlaşmaktadır.

## 16. Geliştirici

**Mert Gülseren**

GitHub: https://github.com/Mert-gulseren

---

Bu proje eğitim ve yazılım geliştirme amacıyla hazırlanmıştır.
