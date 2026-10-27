# UNO Discord Botu

Components V2 arayüzlü, masa / el / lobi / profil görselleri Puppeteer ile çizilen UNO botu.
Tüm emojiler kod ile çizilip uygulama emojisi olarak yüklenir, hiçbir yerde Unicode emoji yoktur.

## Kurulum
1. Node.js 20+ gerekir. `npm install` (Puppeteer Chromium'u kendisi indirir).
2. Developer Portal > Bot > **Message Content Intent** açık olmalı.
3. Token'ı `DISCORD_TOKEN` ortam değişkenine ya da `config.json` içindeki `token` alanına yaz.
4. `npm start`. İlk açılışta emojiler çizilip yüklenir (birkaç dakika sürer, bot bu sırada kullanılabilir).

Bot izinleri: Kanalı Görüntüle, Mesaj Gönder, Dosya Ekle, Harici Emoji Kullan, Mesaj Geçmişini Oku, Mesajları Yönet (eski masayı silmek için).

## Komutlar (prefix `!`)
| Komut | Açıklama |
|---|---|
| `!uno` | Lobi açar. Oyun sırasında UNO çağırır / UNO demeyeni yakalar |
| `!katil` `!ayril` `!baslat` `!iptal` | Lobi ve oyun yönetimi |
| `!at kirmizi 5` `!at mavi atla` `!at joker sari` `!at +4 yesil` `!at 3` | Kart atar (son örnek: elindeki sıra numarası) |
| `!at duello mavi @kisi` | Hedefli güç kartı |
| `!cek` `!pas` `!itiraz` | Kart çek, pas geç, +4'e itiraz |
| `!kartlarim` `!masa` | Elini gizli aç, masayı yeniden gönder |
| `!profil [@kisi]` `!siralama` `!kartlar` `!yardim` | Bilgi ekranları |
| `!emoji liste/sync [force]/ata/sifirla` | Emoji yönetimi (yönetici) |

Oyun içinde her şey butonlarla da yapılır: **Kartlarım** elini sadece sana gösterir, kart seçimi menüden yapılır.

## Kurallar
Klasik UNO + +2/+4 istifleme, ilk +4'e itiraz, atlama (birebir aynı kartla sıra beklemeden), UNO yakalama,
2 kişide Ters = Atla, süre aşımında otomatik çekiş (üst üste 2 kez = oyundan çıkar). Ayarlar lobide açılıp kapanır.

8 güç kartı (joker gibi atılır): Kasırga, Rövanş, Kalkan, Röntgen, Büyük Takas, Düello, Hasat, Çifte Hamle. Ayrıntı: `!kartlar`.

## Yeni komut eklemek
`src/commands/` içine `export const name`, `aliases`, `description`, `execute(message, ctx)` dışa aktaran bir dosya koy; otomatik yüklenir.

## Test
`npm test` sahte Discord ile baştan sona bir oyun oynatır, Components V2 yüklerini doğrular (limitler, Unicode emoji taraması) ve görselleri `test/out/flow` içine yazar.
`node test/engine.js` oyun motorunu 600 rastgele oyunla sınar.
