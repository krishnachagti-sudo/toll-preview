# QR Code de Wi-Fi: como é o texto dentro do código

Um QR Code de Wi-Fi guarda uma linha de texto, por exemplo WIFI:T:WPA;S:Cafe Guest;P:tea\\;time42;;. T é a segurança (WPA, WEP, WPA2-EAP ou nopass), S o nome da rede e P a senha; os caracteres \\ ; , " : recebem uma barra invertida na frente. Este exemplo é a versão 3 (29 x 29 módulos) no nível M.

## Como é o texto de um QR Code de Wi-Fi?

```
WIFI:T:WPA;S:Cafe Guest;P:tea\;time42;;
WIFI:T:nopass;S:Lobby;;
```

O ponto e vírgula da senha do exemplo (tea;time42) tem uma barra invertida na frente; sem ela, o celular daria o campo por encerrado ali. A segunda linha é uma rede aberta, sem senha.

## Qual o tamanho do código?

O exemplo tem 39 bytes. Quanto maior a correção de erros, maior o código: no nível L é a versão 3 (29 x 29), no M a 3 (29 x 29), no Q a 4 (33 x 33) e no H a 5 (37 x 37). Um código maior precisa de mais espaço na impressão.

## Como escrever uma rede oculta?

Com H:true antes do ponto e vírgula final, como neste texto gerado: `WIFI:T:WPA;S:Gaeste-Netz;P:Sommer2026;H:true;;`

## E as redes corporativas?

Redes corporativas acrescentam E: (método EAP), A: (identidade anônima), I: (identidade) e PH2: (fase 2), como o ZXing documenta. O suporte dos celulares varia; teste com os celulares que os seus convidados usam.

[Gerar o código de Wi-Fi no gerador](https://krishnachagti-sudo.github.io/toll-preview/pt/qr-code-generator/?type=wifi) (o código é feito no seu navegador, nada é enviado).

## Leia isto

- Um código estático guarda o conteúdo diretamente e não expira, mas só funciona enquanto o destino dele (site, formulário, rede) existir.
- Faça um escaneamento de teste de cada código no tamanho final de impressão antes de imprimir a tiragem.
- Conferência de validade: ela informa o que o código contém e para onde ele redireciona hoje, mais a política publicada do fornecedor na data indicada; não vê a sua conta nem pode prometer o que um fornecedor fará. As políticas são resumidas das páginas do próprio fornecedor na data indicada e podem mudar; não somos afiliados a nenhum fornecedor citado.
- Códigos de Wi-Fi: o suporte dos celulares varia, principalmente nos campos corporativos (WPA2-EAP); teste com os celulares que os seus convidados usam.
- QR Code is registered trademark of DENSO WAVE INCORPORATED.

## Fontes

- [ZXing wiki: Barcode Contents (WiFi, SMS, geo, tel, mailto, vCard), lida em 2 de novembro de 2026](https://github.com/zxing/zxing/wiki/Barcode-Contents)

## Passos

1. **Comece com WIFI:.** Depois vêm os campos, cada um terminado em ponto e vírgula, em qualquer ordem.
2. **Segurança.** T:WPA para redes pessoais WPA, WPA2 e WPA3, T:WEP, T:WPA2-EAP para redes corporativas ou T:nopass para uma rede aberta.
3. **Nome e senha.** S: o nome da rede, P: a senha. Coloque uma barra invertida antes de qualquer \\ ; , " ou :. Um nome ou senha que possa ser lido como hexadecimal vai entre aspas duplas.
4. **Final.** Acrescente H:true para uma rede oculta e termine com um segundo ponto e vírgula.

## Perguntas

### Como é o texto de um QR Code de Wi-Fi?

Uma linha como WIFI:T:WPA;S:Cafe Guest;P:tea\\;time42;;. T é a segurança, S o nome da rede e P a senha; os caracteres \\ ; , " : recebem uma barra invertida na frente.

### Como faço um QR Code para uma rede Wi-Fi aberta?

Com T:nopass e sem senha, por exemplo WIFI:T:nopass;S:Lobby;;.

### Funciona em todos os celulares?

Não há garantia: o suporte varia, principalmente nos campos corporativos (WPA2-EAP). Teste com os celulares que os seus convidados usam.

## Páginas relacionadas

- [QR Code expira?](https://krishnachagti-sudo.github.io/toll-preview/pt/qr-code-que-nao-expira/)
- [QR Code para cartão de visita (vCard)](https://krishnachagti-sudo.github.io/toll-preview/pt/qr-code-cartao-de-visita/)
- [Gerador de QR Code](https://krishnachagti-sudo.github.io/toll-preview/pt/qr-code-generator/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/pt/qr-code-wifi/  
Dados de: 2026-11-02
