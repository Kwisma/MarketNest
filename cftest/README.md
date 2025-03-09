```bash
 mv CloudflareST cfst
```

```bash
 ./cfst -dn 9999999 -tp 443 -url https://speed.cloudflare.com/__down?bytes=500000000 -tlr 0
```

```bash
curl -o package.json 'https://raw.githubusercontent.com/Kwisma/MarketNest/refs/heads/main/cftest/package.json'
```

```bash
curl -o index.js 'https://raw.githubusercontent.com/Kwisma/MarketNest/refs/heads/main/cftest/index.js'
```

```bash
curl -o ip.txt 'https://raw.githubusercontent.com/Kwisma/MarketNest/refs/heads/main/cftest/asn/AS45102.txt'
```

```bash
npm install
```

```bash
node index.js
```
