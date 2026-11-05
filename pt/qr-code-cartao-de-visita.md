# QR Code para cartão de visita: o formato vCard

Um QR Code de contato guarda um vCard: BEGIN:VCARD, VERSION:3.0, nome, telefone, e-mail e outras linhas, depois END:VCARD, com vírgulas, pontos e vírgulas e barras invertidas do texto marcados com uma barra invertida (RFC 2426). O exemplo abaixo é a versão 9 (53 x 53 módulos) no nível M; um QR Code comporta no máximo 2.953 bytes no nível L.

## Como é o vCard dentro de um QR Code?

```
BEGIN:VCARD
VERSION:3.0
N:Souza;Ana;;;
FN:Ana Souza
ORG:Exemplo Ltda
TEL;TYPE=WORK,VOICE:+5511912345678
EMAIL;TYPE=INTERNET:ana@example.com
END:VCARD
```

O vCard tem 156 bytes. Cada linha a mais (endereço, site, observação) deixa o código maior e mais denso. O nível M restaura cerca de 15% das palavras-código e, segundo a DENSO WAVE, é o mais escolhido; imprima um código denso em tamanho maior.

## E na hora de imprimir o cartão?

Faça um escaneamento de teste no tamanho final. Módulos escuros sobre fundo claro e uma margem livre de quatro módulos em volta são o que melhor lê; o gerador avisa quando o contraste, a margem ou os pontos da impressora por módulo ficam curtos.

[Criar o cartão de contato no gerador](https://krishnachagti-sudo.github.io/toll-preview/pt/qr-code-generator/?type=vcard) (o código é feito no seu navegador, nada é enviado).

## Leia isto

- Um código estático guarda o conteúdo diretamente e não expira, mas só funciona enquanto o destino dele (site, formulário, rede) existir.
- Faça um escaneamento de teste de cada código no tamanho final de impressão antes de imprimir a tiragem.
- Conferência de validade: ela informa o que o código contém e para onde ele redireciona hoje, mais a política publicada do fornecedor na data indicada; não vê a sua conta nem pode prometer o que um fornecedor fará. As políticas são resumidas das páginas do próprio fornecedor na data indicada e podem mudar; não somos afiliados a nenhum fornecedor citado.
- Códigos de Wi-Fi: o suporte dos celulares varia, principalmente nos campos corporativos (WPA2-EAP); teste com os celulares que os seus convidados usam.
- QR Code is registered trademark of DENSO WAVE INCORPORATED.

## Fontes

- [RFC 2426: vCard 3.0 (escaping of commas, semicolons, backslashes and newlines), lida em 2 de novembro de 2026](https://www.rfc-editor.org/rfc/rfc2426)
- [ZXing wiki: Barcode Contents (WiFi, SMS, geo, tel, mailto, vCard), lida em 2 de novembro de 2026](https://github.com/zxing/zxing/wiki/Barcode-Contents)
- [DENSO WAVE: Error correction (Level M 15% is most often selected), lida em 2 de novembro de 2026](https://www.qrcode.com/en/about/error_correction.html)

## Perguntas

### Como faço um QR Code para o meu cartão de visita?

No gerador, escolha Cartão de contato, preencha nome, telefone e e-mail e baixe PNG, SVG ou PDF. O código contém um vCard 3.0, que os celulares podem salvar como contato.

### O QR Code do cartão de visita expira?

Não, se for estático: os dados estão no próprio código. Ele só fica desatualizado se os seus dados mudarem; aí você gera um novo.

## Páginas relacionadas

- [QR Code de Wi-Fi](https://krishnachagti-sudo.github.io/toll-preview/pt/qr-code-wifi/)
- [QR Code expira?](https://krishnachagti-sudo.github.io/toll-preview/pt/qr-code-que-nao-expira/)
- [Gerador de QR Code](https://krishnachagti-sudo.github.io/toll-preview/pt/qr-code-generator/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/pt/qr-code-cartao-de-visita/  
Dados de: 2026-11-02
