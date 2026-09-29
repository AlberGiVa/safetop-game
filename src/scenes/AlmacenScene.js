// ============================================================
//  ALMACÉN EPI — colección y tienda con Safecoins
//  Cada producto comprado da una ventaja en algún modo.
// ============================================================

class AlmacenScene extends Phaser.Scene {
  constructor() { super('Almacen'); }

  create() {
    this.cameras.main.setBackgroundColor(BRAND.navy);
    this.filter = 'all';
    this.scrollY = 0;

    // Capa fija (barra superior + pestañas)
    this.add.rectangle(W / 2, 90, W, 180, BRAND.navy).setScrollFactor(0).setDepth(19);
    this.add.text(24, 48, 'ALMACÉN EPI', { fontFamily: FONT, fontSize: '30px', fontStyle: 'bold', color: CSS.orange })
      .setOrigin(0, 0.5).setScrollFactor(0).setDepth(20);
    this.bar = makeTopBar(this);
    this.bar.exit.setScrollFactor(0); this.bar.icon.setScrollFactor(0); this.bar.txt.setScrollFactor(0);

    this.add.text(24, 84, 'Compra EPI Safetop con tus Safecoins. Cada uno te da una ventaja.', {
      fontFamily: FONT, fontSize: '13px', color: CSS.grey
    }).setScrollFactor(0).setDepth(20);

    // Pestañas de familia
    const tabs = [{ id: 'all', emoji: '★' }].concat(Object.keys(FAMILIES).map(f => ({ id: f, emoji: FAMILIES[f].emoji })));
    this.tabObjs = [];
    tabs.forEach((t, i) => {
      const x = 44 + i * 62;
      const bg = this.add.circle(x, 138, 26, BRAND.navy2).setScrollFactor(0).setDepth(20).setInteractive({ useHandCursor: true });
      const tx = this.add.text(x, 138, t.emoji, { fontSize: '24px', color: CSS.white }).setOrigin(0.5).setScrollFactor(0).setDepth(21);
      bg.on('pointerup', () => { Sfx.tap(); this.filter = t.id; this.buildList(); });
      this.tabObjs.push({ id: t.id, bg });
    });

    this.listObjs = [];
    this.buildList();

    // Scroll con arrastre y rueda
    this.input.on('pointermove', p => {
      if (!p.isDown) return;
      this.scrollTo(this.cameras.main.scrollY - (p.y - p.prevPosition.y));
    });
    this.input.on('wheel', (p, objs, dx, dy) => this.scrollTo(this.cameras.main.scrollY + dy * 0.6));
  }

  scrollTo(y) {
    const max = Math.max(0, this.contentH - H);
    this.cameras.main.scrollY = Phaser.Math.Clamp(y, 0, max);
  }

  buildList() {
    this.listObjs.forEach(o => o.destroy());
    this.listObjs = [];
    this.tabObjs.forEach(t => t.bg.setFillStyle(t.id === this.filter ? BRAND.orange : BRAND.navy2));
    this.cameras.main.scrollY = 0;

    const ids = Object.keys(PRODUCTS).filter(id => this.filter === 'all' || PRODUCTS[id].family === this.filter);
    const cardW = 500, cardH = 150, x0 = W / 2;
    makePanelTexture(this, 'shopcard', cardW, cardH, BRAND.navy2, 18);
    makePanelTexture(this, 'shopcard_owned', cardW, cardH, 0x1b3a2f, 18);

    let y = 190 + cardH / 2;
    let lastFamily = null;
    ids.forEach(id => {
      const p = PRODUCTS[id];
      if (this.filter === 'all' && p.family !== lastFamily) {
        lastFamily = p.family;
        const h = this.add.text(30, y - cardH / 2 + 2, FAMILIES[p.family].emoji + '  ' + FAMILIES[p.family].label.toUpperCase(), {
          fontFamily: FONT, fontSize: '16px', fontStyle: 'bold', color: CSS.grey
        });
        this.listObjs.push(h);
        y += 30;
      }
      const owned = Wallet.has(id);
      const card = this.add.image(x0, y, owned ? 'shopcard_owned' : 'shopcard');
      const left = x0 - cardW / 2;
      const icon = this.add.image(left + 55, y - 10, 'prod_' + id).setScale(0.85);
      const name = this.add.text(left + 110, y - 58, p.name, { fontFamily: FONT, fontSize: '19px', fontStyle: 'bold', color: CSS.white });
      const norm = this.add.text(left + 110, y - 34, (p.ref ? 'Ref. ' + p.ref + ' · ' : '') + p.norm, { fontFamily: FONT, fontSize: '12px', color: CSS.blue ? '#2bb0e6' : CSS.grey });
      const desc = this.add.text(left + 110, y - 16, p.desc, { fontFamily: FONT, fontSize: '12px', color: CSS.grey, wordWrap: { width: 370 } });
      const perk = this.add.text(left + 110, y + 30, '★ ' + p.perk, { fontFamily: FONT, fontSize: '13px', fontStyle: 'bold', color: CSS.yellow, wordWrap: { width: 370 } });
      this.listObjs.push(card, icon, name, norm, desc, perk);
      if (p.brand) {
        const b = this.add.text(left + 115 + name.width, y - 55, p.brand, { fontFamily: FONT, fontSize: '11px', fontStyle: 'bold', color: CSS.navy, backgroundColor: CSS.grey, padding: { x: 5, y: 2 } });
        this.listObjs.push(b);
      }
      if (p.isNew) {
        const n = this.add.text(left + cardW - 12, y - cardH / 2 + 12, 'NUEVO', { fontFamily: FONT, fontSize: '11px', fontStyle: 'bold', color: CSS.white, backgroundColor: CSS.red, padding: { x: 6, y: 3 } }).setOrigin(1, 0);
        this.listObjs.push(n);
      }

      if (owned) {
        const tag = this.add.text(left + 55, y + 48, 'EN TU TAQUILLA', { fontFamily: FONT, fontSize: '10px', fontStyle: 'bold', color: CSS.green }).setOrigin(0.5);
        this.listObjs.push(tag);
      } else {
        const btn = makeButton(this, left + 55, y + 50, 96, 34, p.price + ' ', BRAND.orange, () => this.tryBuy(id), 16);
        const c = this.add.image(left + 80, y + 50, 'safecoin').setScale(0.45);
        this.listObjs.push(btn.img, btn.txt, c);
      }
      y += cardH + 14;
    });

    // Reiniciar progreso (pide confirmación con un segundo toque)
    if (this.filter === 'all') {
      const reset = this.add.text(W / 2, y + 20, 'Reiniciar progreso', { fontFamily: FONT, fontSize: '14px', color: CSS.dim }).setOrigin(0.5).setInteractive({ useHandCursor: true });
      reset.on('pointerup', () => {
        if (!reset.armed) { reset.armed = true; reset.setText('¿Seguro? Toca otra vez para borrar Safecoins, compras y récords').setColor(CSS.red); return; }
        try { Object.keys(localStorage).filter(k => k.startsWith('safetop_')).forEach(k => localStorage.removeItem(k)); } catch (e) {}
        Save.set('welcomed', true);
        this.scene.start('Menu');
      });
      this.listObjs.push(reset);
      y += 40;
    }
    this.contentH = y + 20;
  }

  tryBuy(id) {
    const p = PRODUCTS[id];
    if (Wallet.coins() < p.price) {
      Sfx.fail();
      this.cameras.main.shake(150, 0.005);
      toast(this, 'Te faltan ' + (p.price - Wallet.coins()) + ' Safecoins\n¡Juega para conseguir más!', this.cameras.main.scrollY + 480, BRAND.red);
      return;
    }
    Wallet.buy(id);
    Sfx.coin(); Sfx.level();
    toast(this, '¡' + p.name + ' en tu taquilla!\n' + p.perk, this.cameras.main.scrollY + 480, 0x1b7a4f);
    this.bar.refresh();
    const sy = this.cameras.main.scrollY;
    this.buildList();
    this.scrollTo(sy);
  }
}
