// Zar atma sistemi - Son hali bu olcak buraya bak bida
document.addEventListener("DOMContentLoaded", () => {
  const rollButton = document.getElementById("rollButton");
  const resultDisplay = document.getElementById("resultDisplay");
  const resultNumber = document.getElementById("resultNumber");
  const resultBreakdown = document.getElementById("resultBreakdown");
  const modifierInput = document.getElementById("modifier");
  const d20Icon = document.getElementById("d20Icon");
  const magicParticles = document.getElementById("magicParticles");
  
  if (!rollButton || !resultDisplay || !resultNumber) {
    console.error("Gerekli elementler bulunamadı!");
    return;
  }

  // Ses efektleri - mevcut ses dosyasını kullan ses dcye gitmio amk obs visual camera isini cozsene 
  const diceRollSound = new Audio('sounds/dice-roll-201898.mp3');
  const criticalHitSound = new Audio('sounds/critical-hit.mp3');
  const criticalFailSound = new Audio('sounds/critical-fail.mp3');
  
  // Ses dosyalarının yüklenmesini bekle ve hata kontrolü
  diceRollSound.volume = 0.8;
  diceRollSound.preload = 'auto';
  
  // Ses dosyası yüklenene kadar bekle
  diceRollSound.addEventListener('canplaythrough', () => {
    console.log('Zar sesi hazır!');
  });
  
  diceRollSound.addEventListener('error', (e) => {
    console.error('Ses dosyası yüklenemedi:', e);
  });
  
  if (criticalHitSound) criticalHitSound.volume = 0.8;
  if (criticalFailSound) criticalFailSound.volume = 0.8;

  let isRolling = false;
  let rollAnimationInterval = null;

  // Zar animasyonu 
  function animateDiceRoll(finalRoll, finalTotal, modifier) {
    let count = 0;
    const maxCount = 20; // 20 kere değişsin
    
    rollAnimationInterval = setInterval(() => {
      // Rastgele sayı göster (son sayı hariç)
      let randomNum;
      do {
        randomNum = Math.floor(Math.random() * 20) + 1;
      } while (randomNum === finalRoll && count < maxCount - 3);
      
      const randomMod = modifier || 0;
      resultNumber.textContent = randomMod !== 0 ? `${randomNum + randomMod}` : randomNum;
      count++;
      
      if (count >= maxCount) {
        clearInterval(rollAnimationInterval);
        resultNumber.textContent = finalTotal;
        resultNumber.classList.add("rolling");
        
        // Animasyon bitince class'ı kaldır
        setTimeout(() => {
          resultNumber.classList.remove("rolling");
          if (d20Icon) d20Icon.classList.remove("rolling");
        }, 1000);
      }
    }, 50); // Her 50ms'de bir değişsin
  }

  // Sonucu göster
  function showResult(roll, total, modifier) {
    // Sonucu göster
    resultNumber.textContent = total;
    resultNumber.classList.remove("critical-fail", "critical-hit");
    
    // Breakdown göster
    if (resultBreakdown) {
      if (modifier !== 0) {
        resultBreakdown.textContent = `${roll} ${modifier > 0 ? "+" : "-"} ${Math.abs(modifier)} = ${total}`;
      } else {
        resultBreakdown.textContent = `${roll}`;
      }
    }
    
    // Kritik animasyonlar ve sesler
    if (roll === 1) {
      resultNumber.classList.add("critical-fail");
      createParticles(resultNumber, "crimson");
      if (criticalFailSound) {
        criticalFailSound.currentTime = 0;
        criticalFailSound.play().catch(() => {});
      }
    } else if (roll === 20) {
      resultNumber.classList.add("critical-hit");
      createParticles(resultNumber, "gold");
      if (criticalHitSound) {
        criticalHitSound.currentTime = 0;
        criticalHitSound.play().catch(() => {});
      }
    } else {
      createParticles(rollButton, "gold", 8);
    }
    
    resultDisplay.classList.add("show");
    
    // Butonu tekrar aktif et
    rollButton.classList.remove("rolling");
    rollButton.style.opacity = "1";
    rollButton.style.pointerEvents = "auto";
    isRolling = false;
  }


  // Partikül efektleri
  function createParticles(element, color, count = 15) {
    if (!magicParticles || !element) return;
    
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const colorValue = color === "crimson" ? "var(--crimson)" : "var(--gold)";
    
    for (let i = 0; i < count; i++) {
      const particle = document.createElement("div");
      particle.className = "magic-particle";
      particle.style.background = `radial-gradient(circle, ${colorValue}, transparent)`;
      particle.style.boxShadow = `0 0 8px ${colorValue}`;
      
      const angle = (Math.PI * 2 * i) / count;
      const distance = 40 + Math.random() * 30;
      const startX = centerX + Math.cos(angle) * distance;
      const startY = centerY + Math.sin(angle) * distance;
      
      particle.style.left = startX + "px";
      particle.style.top = startY + "px";
      particle.style.animationDelay = Math.random() * 0.2 + "s";
      
      magicParticles.appendChild(particle);
      
      setTimeout(() => {
        if (particle.parentNode) {
          particle.remove();
        }
      }, 2000);
    }
  }

  // Zar atma fonksiyonu
  function rollDice() {
    if (isRolling) return;
    
    isRolling = true;
    resultDisplay.classList.remove("show");
    rollButton.classList.add("rolling");
    if (d20Icon) d20Icon.classList.add("rolling");
    rollButton.style.opacity = "0.7";
    rollButton.style.pointerEvents = "none";
    
    // Zar atma sesini çal - kısa süreli (1 saniye sonra durdur)
    try {
      diceRollSound.currentTime = 0;
      const playPromise = diceRollSound.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log('Zar sesi çalıyor!');
            // 1 saniye sonra sesi durdur
            setTimeout(() => {
              diceRollSound.pause();
              diceRollSound.currentTime = 0;
            }, 1000);
          })
          .catch(error => {
            console.error('Ses çalma hatası:', error);
            // Tekrar dene
            setTimeout(() => {
              diceRollSound.play().then(() => {
                setTimeout(() => {
                  diceRollSound.pause();
                  diceRollSound.currentTime = 0;
                }, 1000);
              }).catch(() => {});
            }, 100);
          });
      }
    } catch (error) {
      console.error('Ses çalma hatası:', error);
    }
    
    // Modifier değerini al
    const modifier = modifierInput ? Number(modifierInput.value) || 0 : 0;
    
    // D20 zar at (1-20 arası)
    const roll = Math.floor(Math.random() * 20) + 1;
    const total = roll + modifier;
    
    // Animasyonu başlat
    animateDiceRoll(roll, total, modifier);
    
    // Zar animasyonu tamamlandıktan sonra sonucu göster
    setTimeout(() => {
      showResult(roll, total, modifier);
    }, 1500); // Animasyon süresi + biraz ekstra
  }

  // Zar atma butonu
  rollButton.addEventListener("click", () => {
    rollDice();
  });

  // Klavye kısayolu - Space tuşu
  document.addEventListener("keydown", (e) => {
    if (e.code === "Space" && !isRolling) {
      e.preventDefault();
      rollDice();
    }
  });

  // Sonuç alanına tıklayınca tekrar at
  resultNumber.addEventListener("click", () => {
    if (!isRolling && resultDisplay.classList.contains("show")) {
      rollDice();
    }
  });
});
