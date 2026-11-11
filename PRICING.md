# Preços automáticos

Em `products.js`, altere somente `card` para definir o preço atual no cartão.
O site calcula automaticamente, pelas regras de `pricing.js`:

- Pix: 5% de desconto, com o resultado arredondado para o real inteiro mais próximo. Valores terminados em 50 centavos arredondam para cima.
- Parcelamento: preço no cartão dividido por 3, exibido com duas casas decimais.
- Promoção: diferença entre `previousCard` e `card`, em porcentagem inteira. Mantenha `previousCard` como o preço anterior verdadeiro.

Não cadastre um valor `pix` separado. A propriedade é calculada a partir de `card`, inclusive se o preço mudar durante a execução.

Exemplos: R$ 99 no cartão → R$ 94 no Pix e 3x de R$ 33. R$ 159 → R$ 151 no Pix e 3x de R$ 53.

A sacola soma o Pix arredondado de cada unidade, preservando os preços apresentados nos produtos. Não aplica novamente o desconto sobre o total. Catálogo, produto, ordenação, sacola e mensagem do WhatsApp usam os mesmos preços calculados.
