// Hacker Terminal Effects
document.addEventListener('DOMContentLoaded', function() {
    initTypingEffect();
    initTerminalEffects();
    initMatrixRain();
    initGlitchEffect();
    initAsciiAnimation();
});

// Typing effect for subtitle
function initTypingEffect() {
    const typingElement = document.querySelector('.typing-text');
    if (!typingElement) return;
    
    const text = typingElement.textContent;
    typingElement.textContent = '';
    
    let i = 0;
    const typeWriter = () => {
        if (i < text.length) {
            typingElement.textContent += text.charAt(i);
            i++;
            setTimeout(typeWriter, 100);
        } else {
            setTimeout(() => {
                i = 0;
                typingElement.textContent = '';
                setTimeout(typeWriter, 1000);
            }, 2000);
        }
    };
    
    setTimeout(typeWriter, 1000);
}

// Terminal command effects
function initTerminalEffects() {
    const commands = document.querySelectorAll('.command-line');
    
    commands.forEach((command, index) => {
        command.style.opacity = '0';
        command.style.transform = 'translateX(-20px)';
        
        setTimeout(() => {
            command.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            command.style.opacity = '1';
            command.style.transform = 'translateX(0)';
        }, index * 500);
    });
    
    // Command outputs
    const outputs = document.querySelectorAll('.command-output');
    outputs.forEach((output, index) => {
        output.style.opacity = '0';
        
        setTimeout(() => {
            output.style.transition = 'opacity 0.5s ease';
            output.style.opacity = '1';
        }, (index + 1) * 500 + 1000);
    });
}

// Matrix rain effect
function initMatrixRain() {
    const canvas = document.createElement('canvas');
    canvas.className = 'matrix-rain';
    document.body.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    const matrix = "ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789@#$%^&*()*&^%+-/~{[|`]}";
    const matrixArray = matrix.split("");
    
    const fontSize = 10;
    const columns = canvas.width / fontSize;
    const drops = [];
    
    for (let x = 0; x < columns; x++) {
        drops[x] = 1;
    }
    
    function drawMatrix() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.04)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#00ff00';
        ctx.font = fontSize + 'px monospace';
        
        for (let i = 0; i < drops.length; i++) {
            const text = matrixArray[Math.floor(Math.random() * matrixArray.length)];
            ctx.fillText(text, i * fontSize, drops[i] * fontSize);
            
            if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        }
    }
    
    setInterval(drawMatrix, 35);
}

// Glitch effect for title
function initGlitchEffect() {
    const title = document.querySelector('.hacker-title h1');
    if (!title) return;
    
    setInterval(() => {
        if (Math.random() < 0.1) {
            title.classList.add('glitch');
            setTimeout(() => {
                title.classList.remove('glitch');
            }, 200);
        }
    }, 3000);
}

// Terminal cursor effect
function initTerminalCursor() {
    const cursor = document.createElement('span');
    cursor.className = 'cursor';
    
    const commandLines = document.querySelectorAll('.command-line');
    commandLines.forEach(line => {
        const command = line.querySelector('.command');
        if (command) {
            command.appendChild(cursor.cloneNode());
        }
    });
}

// Initialize cursor effect
setTimeout(initTerminalCursor, 2000);

// GitHub link hover effect
document.addEventListener('DOMContentLoaded', function() {
    const githubLink = document.querySelector('.github-link');
    if (githubLink) {
        githubLink.addEventListener('mouseenter', function() {
            this.style.textShadow = '0 0 10px #00ff00';
        });
        
        githubLink.addEventListener('mouseleave', function() {
            this.style.textShadow = 'none';
        });
    }
});

// Terminal sound effects (visual feedback)
function playTerminalSound() {
    // Visual feedback instead of actual sound
    const terminal = document.querySelector('.hero-content');
    if (terminal) {
        terminal.style.boxShadow = '0 0 30px rgba(0, 255, 0, 0.3)';
        setTimeout(() => {
            terminal.style.boxShadow = '0 0 20px rgba(0, 255, 0, 0.1)';
        }, 200);
    }
}

// Add click effects to commands
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('command') || e.target.classList.contains('github-link')) {
        playTerminalSound();
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && e.ctrlKey) {
        // Simulate terminal command execution
        const commands = document.querySelectorAll('.command-line');
        commands.forEach(cmd => {
            cmd.style.background = 'rgba(0, 255, 0, 0.1)';
            setTimeout(() => {
                cmd.style.background = 'transparent';
            }, 500);
        });
    }
});

// ASCII Animation - Wrap each character in span
function initAsciiAnimation() {
    const asciiElement = document.getElementById('ascii-text');
    if (!asciiElement) return;
    
    const text = asciiElement.textContent;
    const lines = text.split('\n');
    
    let wrappedText = '';
    let charIndex = 0;
    
    lines.forEach(line => {
        let wrappedLine = '';
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === ' ') {
                wrappedLine += ' ';
            } else {
                wrappedLine += `<span style="animation-delay: ${charIndex * 0.1}s">${char}</span>`;
                charIndex++;
            }
        }
        wrappedText += wrappedLine + '\n';
    });
    
    asciiElement.innerHTML = wrappedText;
}

trackGitHubClick();