# 💱 DEX Prototype

Адаптивний прототип децентралізованої біржі з можливістю обміну токенів через смарт-контракт.

## 📦 Технологічний стек

- **Solidity** — написання смарт-контрактів
- **Hardhat** — тестування і деплой контрактів
- **React + Tailwind CSS** — фронтенд
- **Ethers.js** — взаємодія з Ethereum
- **MetaMask** — підключення гаманця

---

## 🚀 Запуск проєкту

### 1. Клонувати репозиторій

```bash
git clone https://github.com/Padusenko/dex-prototype
cd dex-prototype
```

### 2. Встановити залежності фронтенду

```bash
cd frontend
npm install
```

### 3. Запустити React-додаток

```bash
npm start
```

Після запуску відкрий [http://localhost:3000](http://localhost:3000)

---

## 🔧 Розгортання смарт-контрактів

> Використовується Hardhat для локального деплою.

1. Встановити Hardhat у кореневій директорії:

```bash
npm install --save-dev hardhat
```

2. Скомпілювати контракти:

```bash
npx hardhat compile
```

3. Запустити локальний Hardhat-ноду:

```bash
npx hardhat node
```

4. У новому терміналі розгорнути контракти:

```bash
npx hardhat run scripts/deploy.js --network localhost
npx hardhat run scripts/deployDex.js --network localhost
npx hardhat run scripts/addLiquidity.js --network localhost
```

> ⚠️ Після деплою **скопіюй адреси контрактів** і онови `frontend/src/utils/contracts.js`

---

## ⚠️ Необхідні умови

- Node.js `v16` або новіше
- MetaMask (встановлений у браузері)
- Локальна мережа Hardhat **або** публічний тестнет (Goerli, Sepolia...)

---

## 📝 Автор

[Padusenko](https://github.com/Padusenko)
