// Pix: BR Code estático (padrão EMV do Banco Central). Portado de meu-site/src/apps/qrcode/qr.js.
// Mudança: nome em maiúsculas (regra 8 da spec).
export function crc16(str) {
  let crc = 0xffff;
  for (const b of new TextEncoder().encode(str)) {
    crc ^= b << 8;
    for (let i = 0; i < 8; i++) crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}
const tlv = (id, v) => `${id}${String(new TextEncoder().encode(v).length).padStart(2, '0')}${v}`;
export const semAcento = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '');
export function pixPayload({ chave, nome, cidade, valor, descricao, txid }) {
  const conta = tlv('00', 'br.gov.bcb.pix') + tlv('01', chave) + (descricao ? tlv('02', descricao.slice(0, 60)) : '');
  let p = '000201' + tlv('26', conta) + '52040000' + '5303986';
  if (valor > 0) p += tlv('54', valor.toFixed(2));
  p += '5802BR' + tlv('59', semAcento(nome).toUpperCase().slice(0, 25) || 'N') + tlv('60', semAcento(cidade).toUpperCase().slice(0, 15) || 'BRASIL');
  p += tlv('62', tlv('05', (txid || '***').replace(/[^A-Za-z0-9]/g, '').slice(0, 25) || '***'));
  p += '6304';
  return p + crc16(p);
}
