// Generated from the design canvas (Småstaden = artboard A2, Pixelstaden = B2).
// Static, trusted markup: player tokens, the clock and dialogs are drawn on top in board.tsx.
// Pixelstaden: parts with class="amb-*" are animated in ekorrhjulet.css, and its cars are drawn
// moving in board.tsx (the parked ones from the design were removed).
// The clickable places are separate buttons laid over the drawing. Fonts are set in ekorrhjulet.css.

export const SMASTADEN_SVG = `<svg width="100%" height="100%" preserveAspectRatio="xMidYMid meet" viewBox="0 0 1280 880" role="img" aria-label="Tecknad stad i 2,5D med tio byggnader runt en ringväg, bilar, träd och en park med blomsterklocka och damm">
<defs>
<pattern id="gras" width="90" height="90" patternUnits="userSpaceOnUse">
<path d="M12 20 l3 -7 l3 7 M60 64 l3 -7 l3 7 M70 18 l3 -6 l3 6" stroke="#84C45E" stroke-width="2" fill="none" stroke-linecap="round"></path>
<circle cx="38" cy="44" r="2.5" fill="#B5E78F"></circle><circle cx="82" cy="80" r="2" fill="#B5E78F"></circle><circle cx="20" cy="76" r="2" fill="#FFF3A6"></circle>
</pattern>
<linearGradient id="glas" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#D9F3FF"></stop><stop offset="1" stop-color="#7CC8F2"></stop></linearGradient>
<linearGradient id="ljus" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFF6CC"></stop><stop offset="1" stop-color="#FFC94D"></stop></linearGradient>
<filter id="mjuk" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="3"></feGaussianBlur></filter>
</defs>
<rect x="0" y="0" width="1280" height="880" fill="url(#gras)"></rect>
<g transform="translate(0,40)" stroke="#3A2E4F" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">
<rect x="200" y="270" width="880" height="360" rx="110" fill="none" stroke="#3A2E4F" stroke-width="100"></rect>
<rect x="200" y="270" width="880" height="360" rx="110" fill="none" stroke="#ECE4D2" stroke-width="94"></rect>
<rect x="200" y="270" width="880" height="360" rx="110" fill="none" stroke="#C9BFAA" stroke-width="72"></rect>
<rect x="200" y="270" width="880" height="360" rx="110" fill="none" stroke="#5A5E73" stroke-width="66"></rect>
<rect x="200" y="270" width="880" height="360" rx="110" fill="none" stroke="#F5F1E6" stroke-width="3" stroke-dasharray="16 14"></rect>
<g fill="#F5F1E6" stroke="none"><rect x="604" y="240" width="9" height="60" rx="2"></rect><rect x="619" y="240" width="9" height="60" rx="2"></rect><rect x="634" y="240" width="9" height="60" rx="2"></rect><rect x="649" y="240" width="9" height="60" rx="2"></rect><rect x="664" y="240" width="9" height="60" rx="2"></rect></g>
<rect x="250" y="320" width="780" height="260" rx="62" fill="#AEE383"></rect>
<path d="M470 470 C 540 560, 700 600, 790 520 S 850 440, 830 430" fill="none" stroke="#EBD9AE" stroke-width="16"></path>
<path d="M470 470 C 540 560, 700 600, 790 520 S 850 440, 830 430" fill="none" stroke="#F6EBCB" stroke-width="10"></path>
<ellipse cx="910" cy="470" rx="96" ry="50" fill="#5DBDEB"></ellipse>
<ellipse cx="910" cy="474" rx="80" ry="38" fill="#7FD3F7" stroke="none"></ellipse>
<path d="M856 456 q14 -8 30 -6 M930 494 q16 4 30 -4" stroke="#FFFFFF" stroke-width="3" fill="none" opacity="0.8"></path>
<path d="M872 486 a10 6 0 1 0 14 -6 l-7 4 z" fill="#5DBB4A" stroke-width="2"></path>
<path d="M960 452 a9 5 0 1 0 12 -5 l-6 3 z" fill="#5DBB4A" stroke-width="2"></path>
<g transform="translate(930,470)">
<ellipse cx="0" cy="0" rx="15" ry="9" fill="#FFFFFF"></ellipse>
<circle cx="10" cy="-11" r="7" fill="#FFFFFF"></circle>
<path d="M16 -11 l8 2 -8 4z" fill="#FFB020" stroke-width="2"></path>
<circle cx="11" cy="-12" r="1.4" fill="#3A2E4F" stroke="none"></circle>
</g>
<g transform="translate(1000,372)"><ellipse cx="6" cy="2" rx="20" ry="6" fill="#2B2340" opacity="0.18" stroke="none" filter="url(#mjuk)"></ellipse><rect x="-4" y="-16" width="8" height="18" fill="#8A5A2B"></rect><circle cx="0" cy="-30" r="21" fill="#3F9A3A"></circle><circle cx="-4" cy="-34" r="14" fill="#5DBB4A" stroke="none"></circle><circle cx="-8" cy="-39" r="6" fill="#8AD86A" stroke="none"></circle></g>
<g transform="translate(990,572)"><ellipse cx="6" cy="2" rx="18" ry="6" fill="#2B2340" opacity="0.18" stroke="none" filter="url(#mjuk)"></ellipse><rect x="-4" y="-14" width="8" height="16" fill="#8A5A2B"></rect><circle cx="0" cy="-27" r="18" fill="#3F9A3A"></circle><circle cx="-4" cy="-31" r="12" fill="#5DBB4A" stroke="none"></circle><circle cx="-7" cy="-35" r="5" fill="#8AD86A" stroke="none"></circle></g>
<g transform="translate(818,384)"><ellipse cx="6" cy="2" rx="18" ry="6" fill="#2B2340" opacity="0.18" stroke="none" filter="url(#mjuk)"></ellipse><rect x="-4" y="-14" width="8" height="16" fill="#8A5A2B"></rect><circle cx="0" cy="-27" r="18" fill="#2F8A3A"></circle><circle cx="-4" cy="-31" r="12" fill="#4DAE3C" stroke="none"></circle><circle cx="-7" cy="-35" r="5" fill="#7FCE5E" stroke="none"></circle></g>
<g transform="translate(762,560)">
<rect x="-26" y="-8" width="52" height="8" rx="3" fill="#C98A45"></rect>
<rect x="-26" y="-18" width="52" height="6" rx="3" fill="#E9AE68"></rect>
<path d="M-20 0 v8 M20 0 v8" stroke-width="3"></path>
</g>
<circle cx="640" cy="450" r="112" fill="#4E9E3A"></circle>
<circle cx="640" cy="450" r="100" fill="#8FD36A" stroke="none"></circle>
<circle cx="640" cy="450" r="70" fill="#FFF8E4"></circle>
<g stroke-width="2.5">
<circle cx="640" cy="362" r="7" fill="#C9A878"></circle>
<circle cx="684" cy="374" r="7" fill="#C9A878"></circle>
<circle cx="716" cy="406" r="7" fill="#C9A878"></circle>
<circle cx="728" cy="450" r="7" fill="#C9A878"></circle>
<circle cx="716" cy="494" r="7" fill="#C9A878"></circle>
<circle cx="684" cy="526" r="11" fill="#FF7A59"></circle>
<circle cx="640" cy="538" r="11" fill="#FFD23F"></circle>
<circle cx="596" cy="526" r="11" fill="#FF9EC7"></circle>
<circle cx="564" cy="494" r="11" fill="#B48CF2"></circle>
<circle cx="552" cy="450" r="11" fill="#FF7A59"></circle>
<circle cx="564" cy="406" r="11" fill="#FFD23F"></circle>
<circle cx="596" cy="374" r="11" fill="#FF9EC7"></circle>
</g>
<g fill="#FFF3A6" stroke="none">
<circle cx="684" cy="526" r="4"></circle><circle cx="640" cy="538" r="4"></circle><circle cx="596" cy="526" r="4"></circle><circle cx="564" cy="494" r="4"></circle><circle cx="552" cy="450" r="4"></circle><circle cx="564" cy="406" r="4"></circle><circle cx="596" cy="374" r="4"></circle>
</g>
<g transform="translate(300,334)"><path d="M0 0 v-30" stroke-width="3"></path><circle cx="0" cy="-34" r="6" fill="#FFE58A"></circle></g>
<g transform="translate(980,334)"><path d="M0 0 v-30" stroke-width="3"></path><circle cx="0" cy="-34" r="6" fill="#FFE58A"></circle></g>
<g transform="translate(820,268)">
<ellipse cx="4" cy="14" rx="26" ry="5" fill="#2B2340" opacity="0.25" stroke="none" filter="url(#mjuk)"></ellipse>
<rect x="-26" y="-13" width="52" height="26" rx="9" fill="#FF5A5F"></rect>
<rect x="-10" y="-10" width="22" height="20" rx="5" fill="#FF8A8E" stroke-width="2"></rect>
<rect x="13" y="-10" width="6" height="20" rx="2" fill="#3A2E4F" stroke="none"></rect>
<rect x="-17" y="-10" width="5" height="20" rx="2" fill="#3A2E4F" stroke="none"></rect>
<circle cx="24" cy="-8" r="2.5" fill="#FFF3A6" stroke="none"></circle><circle cx="24" cy="8" r="2.5" fill="#FFF3A6" stroke="none"></circle>
</g>
<g transform="translate(1080,420) rotate(90)">
<ellipse cx="4" cy="14" rx="26" ry="5" fill="#2B2340" opacity="0.25" stroke="none" filter="url(#mjuk)"></ellipse>
<rect x="-26" y="-13" width="52" height="26" rx="9" fill="#6EC1FF"></rect>
<rect x="-10" y="-10" width="22" height="20" rx="5" fill="#A9DDFC" stroke-width="2"></rect>
<rect x="13" y="-10" width="6" height="20" rx="2" fill="#3A2E4F" stroke="none"></rect>
<rect x="-17" y="-10" width="5" height="20" rx="2" fill="#3A2E4F" stroke="none"></rect>
</g>
<g transform="translate(780,630)">
<ellipse cx="4" cy="16" rx="50" ry="5" fill="#2B2340" opacity="0.25" stroke="none" filter="url(#mjuk)"></ellipse>
<rect x="-50" y="-15" width="100" height="30" rx="8" fill="#FFD23F"></rect>
<rect x="-50" y="-4" width="100" height="8" fill="#FF7A59" stroke="none"></rect>
<rect x="-46" y="-11" width="90" height="4" rx="2" fill="#FFF3A6" stroke="none"></rect>
<rect x="-50" y="-15" width="8" height="30" rx="3" fill="#3A2E4F" stroke="none"></rect>
<rect x="-50" y="-15" width="100" height="30" rx="8" fill="none"></rect>
</g>
<g transform="translate(108,214)"><ellipse cx="6" cy="2" rx="24" ry="7" fill="#2B2340" opacity="0.18" stroke="none" filter="url(#mjuk)"></ellipse><rect x="-4" y="-18" width="8" height="20" fill="#8A5A2B"></rect><circle cx="0" cy="-36" r="25" fill="#3F9A3A"></circle><circle cx="-5" cy="-40" r="17" fill="#5DBB4A" stroke="none"></circle><circle cx="-10" cy="-46" r="7" fill="#8AD86A" stroke="none"></circle></g>
<g transform="translate(392,210)"><ellipse cx="6" cy="2" rx="20" ry="6" fill="#2B2340" opacity="0.18" stroke="none" filter="url(#mjuk)"></ellipse><rect x="-4" y="-16" width="8" height="18" fill="#8A5A2B"></rect><circle cx="0" cy="-32" r="21" fill="#2F8A3A"></circle><circle cx="-4" cy="-36" r="14" fill="#4DAE3C" stroke="none"></circle><circle cx="-8" cy="-41" r="6" fill="#7FCE5E" stroke="none"></circle></g>
<g transform="translate(632,210)"><ellipse cx="6" cy="2" rx="20" ry="6" fill="#2B2340" opacity="0.18" stroke="none" filter="url(#mjuk)"></ellipse><rect x="-4" y="-16" width="8" height="18" fill="#8A5A2B"></rect><circle cx="0" cy="-32" r="21" fill="#3F9A3A"></circle><circle cx="-4" cy="-36" r="14" fill="#5DBB4A" stroke="none"></circle><circle cx="-8" cy="-41" r="6" fill="#8AD86A" stroke="none"></circle></g>
<g transform="translate(872,210)"><ellipse cx="6" cy="2" rx="20" ry="6" fill="#2B2340" opacity="0.18" stroke="none" filter="url(#mjuk)"></ellipse><rect x="-4" y="-16" width="8" height="18" fill="#8A5A2B"></rect><circle cx="0" cy="-32" r="21" fill="#2F8A3A"></circle><circle cx="-4" cy="-36" r="14" fill="#4DAE3C" stroke="none"></circle><circle cx="-8" cy="-41" r="6" fill="#7FCE5E" stroke="none"></circle></g>
<g transform="translate(1180,214)"><ellipse cx="6" cy="2" rx="24" ry="7" fill="#2B2340" opacity="0.18" stroke="none" filter="url(#mjuk)"></ellipse><rect x="-4" y="-18" width="8" height="20" fill="#8A5A2B"></rect><circle cx="0" cy="-36" r="25" fill="#3F9A3A"></circle><circle cx="-5" cy="-40" r="17" fill="#5DBB4A" stroke="none"></circle><circle cx="-10" cy="-46" r="7" fill="#8AD86A" stroke="none"></circle></g>
<g transform="translate(70,340)"><ellipse cx="6" cy="2" rx="20" ry="6" fill="#2B2340" opacity="0.18" stroke="none" filter="url(#mjuk)"></ellipse><rect x="-4" y="-16" width="8" height="18" fill="#8A5A2B"></rect><circle cx="0" cy="-32" r="21" fill="#2F8A3A"></circle><circle cx="-4" cy="-36" r="14" fill="#4DAE3C" stroke="none"></circle><circle cx="-8" cy="-41" r="6" fill="#7FCE5E" stroke="none"></circle></g>
<g transform="translate(1200,340)"><ellipse cx="6" cy="2" rx="20" ry="6" fill="#2B2340" opacity="0.18" stroke="none" filter="url(#mjuk)"></ellipse><rect x="-4" y="-16" width="8" height="18" fill="#8A5A2B"></rect><circle cx="0" cy="-32" r="21" fill="#3F9A3A"></circle><circle cx="-4" cy="-36" r="14" fill="#5DBB4A" stroke="none"></circle><circle cx="-8" cy="-41" r="6" fill="#8AD86A" stroke="none"></circle></g>
<g transform="translate(76,640)"><ellipse cx="6" cy="2" rx="20" ry="6" fill="#2B2340" opacity="0.18" stroke="none" filter="url(#mjuk)"></ellipse><rect x="-4" y="-16" width="8" height="18" fill="#8A5A2B"></rect><circle cx="0" cy="-32" r="21" fill="#3F9A3A"></circle><circle cx="-4" cy="-36" r="14" fill="#5DBB4A" stroke="none"></circle><circle cx="-8" cy="-41" r="6" fill="#8AD86A" stroke="none"></circle></g>
<g transform="translate(1196,640)"><ellipse cx="6" cy="2" rx="20" ry="6" fill="#2B2340" opacity="0.18" stroke="none" filter="url(#mjuk)"></ellipse><rect x="-4" y="-16" width="8" height="18" fill="#8A5A2B"></rect><circle cx="0" cy="-32" r="21" fill="#2F8A3A"></circle><circle cx="-4" cy="-36" r="14" fill="#4DAE3C" stroke="none"></circle><circle cx="-8" cy="-41" r="6" fill="#7FCE5E" stroke="none"></circle></g>
<g transform="translate(190,212)">
<ellipse cx="90" cy="4" rx="96" ry="10" fill="#2B2340" opacity="0.22" stroke="none" filter="url(#mjuk)"></ellipse>
<polygon points="140,0 162,-14 162,-132 140,-118" fill="#D97FA3"></polygon>
<polygon points="0,-118 22,-132 162,-132 140,-118" fill="#FFC9DC"></polygon>
<rect x="0" y="-118" width="140" height="118" fill="#F7A8C4"></rect>
<rect x="34" y="-136" width="24" height="10" rx="2" fill="#EDE6F5" stroke-width="2.5"></rect>
<path d="M122 -126 v-22 M114 -144 h16" stroke-width="2.5"></path>
<rect x="14" y="-108" width="26" height="22" rx="2" fill="url(#glas)"></rect><rect x="57" y="-108" width="26" height="22" rx="2" fill="url(#ljus)"></rect><rect x="100" y="-108" width="26" height="22" rx="2" fill="url(#glas)"></rect>
<rect x="14" y="-80" width="26" height="22" rx="2" fill="url(#glas)"></rect><rect x="57" y="-80" width="26" height="22" rx="2" fill="url(#glas)"></rect><rect x="100" y="-80" width="26" height="22" rx="2" fill="url(#ljus)"></rect>
<path d="M18 -90 l7 -12 M104 -90 l7 -12 M18 -62 l7 -12 M61 -62 l7 -12" stroke="#FFFFFF" stroke-width="2" opacity="0.9"></path>
<rect x="12" y="-58" width="30" height="6" rx="2" fill="#6BBF4E" stroke-width="2"></rect><rect x="55" y="-58" width="30" height="6" rx="2" fill="#6BBF4E" stroke-width="2"></rect><rect x="98" y="-58" width="30" height="6" rx="2" fill="#6BBF4E" stroke-width="2"></rect>
<g fill="#FF5A8A" stroke="none"><circle cx="18" cy="-60" r="2.5"></circle><circle cx="28" cy="-61" r="2.5"></circle><circle cx="36" cy="-60" r="2.5"></circle><circle cx="104" cy="-60" r="2.5"></circle><circle cx="114" cy="-61" r="2.5"></circle><circle cx="122" cy="-60" r="2.5"></circle></g>
<rect x="10" y="-48" width="120" height="20" rx="6" fill="#FFFFFF" stroke-width="2.5"></rect>
<text x="70" y="-33" text-anchor="middle" font-family="Fredoka" font-weight="700" font-size="14" fill="#3A2E4F" stroke="none">Lägenheten</text>
<rect x="56" y="-26" width="28" height="26" rx="3" fill="#7A4E9C"></rect><circle cx="78" cy="-12" r="1.8" fill="#FFD23F" stroke="none"></circle>
</g>
<g transform="translate(430,212)">
<ellipse cx="90" cy="4" rx="96" ry="10" fill="#2B2340" opacity="0.22" stroke="none" filter="url(#mjuk)"></ellipse>
<polygon points="140,0 162,-14 162,-118 140,-104" fill="#4FA3DA"></polygon>
<polygon points="0,-104 22,-118 162,-118 140,-104" fill="#A9DDFC"></polygon>
<path d="M54 -112 v-12 M112 -112 v-12" stroke-width="4"></path>
<rect x="30" y="-162" width="108" height="40" rx="8" fill="#FFD23F"></rect>
<rect x="36" y="-158" width="96" height="6" rx="3" fill="#FFF3A6" stroke="none"></rect>
<text x="84" y="-133" text-anchor="middle" font-family="Fredoka" font-weight="700" font-size="24" fill="#3A2E4F" stroke="none">JOBB!</text>
<path d="M146 -160 l8 -6 M148 -146 h10 M22 -160 l-8 -6" stroke-width="2.5"></path>
<rect x="0" y="-104" width="140" height="104" fill="#79C6F7"></rect>
<rect x="10" y="-94" width="120" height="32" rx="3" fill="url(#glas)"></rect>
<path d="M40 -94 v32 M70 -94 v32 M100 -94 v32" stroke-width="2.5"></path>
<path d="M16 -66 l12 -22 M76 -66 l12 -22" stroke="#FFFFFF" stroke-width="2.5" opacity="0.9"></path>
<rect x="10" y="-54" width="120" height="22" rx="6" fill="#FFFFFF" stroke-width="2.5"></rect>
<text x="70" y="-38" text-anchor="middle" font-family="Fredoka" font-weight="700" font-size="15" fill="#3A2E4F" stroke="none">Jobbtorget</text>
<rect x="50" y="-28" width="40" height="28" rx="2" fill="url(#glas)"></rect><path d="M70 -28 v28" stroke-width="2.5"></path>
<circle cx="4" cy="-6" r="9" fill="#5DBB4A"></circle><circle cx="136" cy="-6" r="9" fill="#5DBB4A"></circle>
</g>
<g transform="translate(670,212)">
<ellipse cx="90" cy="4" rx="96" ry="10" fill="#2B2340" opacity="0.22" stroke="none" filter="url(#mjuk)"></ellipse>
<polygon points="140,0 162,-14 162,-106 140,-92" fill="#E3B530"></polygon>
<polygon points="70,-134 92,-148 168,-106 146,-92" fill="#D9A520"></polygon>
<rect x="0" y="-92" width="140" height="92" fill="#FFD95E"></rect>
<polygon points="-6,-92 70,-134 146,-92" fill="#FFF0B8"></polygon>
<text x="70" y="-101" text-anchor="middle" font-family="Fredoka" font-weight="700" font-size="13" fill="#3A2E4F" stroke="none">HÖGSKOLAN</text>
<g>
<rect x="12" y="-86" width="12" height="78" fill="#FFFFFF"></rect><rect x="40" y="-86" width="12" height="78" fill="#FFFFFF"></rect><rect x="88" y="-86" width="12" height="78" fill="#FFFFFF"></rect><rect x="116" y="-86" width="12" height="78" fill="#FFFFFF"></rect>
</g>
<g fill="#E6DFCF" stroke="none"><rect x="19" y="-84" width="4" height="74"></rect><rect x="47" y="-84" width="4" height="74"></rect><rect x="95" y="-84" width="4" height="74"></rect><rect x="123" y="-84" width="4" height="74"></rect></g>
<path d="M56 -8 v-30 a14 14 0 0 1 28 0 v30 z" fill="#8A5A2B"></path>
<rect x="-8" y="-8" width="156" height="8" rx="2" fill="#EDE6D6"></rect>
<g transform="translate(150,-160) rotate(-14)"><polygon points="0,8 22,0 44,8 22,16" fill="#3A2E4F"></polygon><path d="M40 9 v12" stroke="#FFD23F" stroke-width="3"></path></g>
</g>
<g transform="translate(910,212)">
<ellipse cx="90" cy="4" rx="96" ry="10" fill="#2B2340" opacity="0.22" stroke="none" filter="url(#mjuk)"></ellipse>
<polygon points="140,0 162,-14 162,-100 140,-86" fill="#2A9E8C"></polygon>
<polygon points="0,-86 22,-100 162,-100 140,-86" fill="#7EE0D2"></polygon>
<path d="M51 -93 A30 28 0 0 1 111 -93 Z" fill="#9BEBDF"></path>
<path d="M62 -100 a20 18 0 0 1 14 -12" stroke="#FFFFFF" stroke-width="3" fill="none"></path>
<ellipse cx="81" cy="-128" rx="11" ry="13" fill="#E0A867"></ellipse>
<ellipse cx="77" cy="-128" rx="3" ry="5" fill="#FFFFFF" opacity="0.6" stroke="none"></ellipse>
<path d="M68 -136 q13 -14 26 0 z" fill="#8A5A2B"></path>
<path d="M81 -146 v-6" stroke-width="3"></path>
<rect x="0" y="-86" width="140" height="86" fill="#43C9B6"></rect>
<rect x="8" y="-80" width="10" height="80" fill="#E6FFFB"></rect><rect x="122" y="-80" width="10" height="80" fill="#E6FFFB"></rect>
<rect x="22" y="-74" width="96" height="22" rx="6" fill="#FFFFFF" stroke-width="2.5"></rect>
<text x="70" y="-58" text-anchor="middle" font-family="Fredoka" font-weight="700" font-size="13" fill="#3A2E4F" stroke="none">Ekollonbanken</text>
<rect x="28" y="-44" width="22" height="24" rx="2" fill="url(#glas)"></rect><rect x="90" y="-44" width="22" height="24" rx="2" fill="url(#glas)"></rect>
<rect x="56" y="-34" width="28" height="34" rx="2" fill="#1F7A6E"></rect><circle cx="70" cy="-18" r="5" fill="#FFD23F" stroke-width="2"></circle>
</g>
<g transform="translate(24,510)">
<ellipse cx="70" cy="4" rx="74" ry="9" fill="#2B2340" opacity="0.22" stroke="none" filter="url(#mjuk)"></ellipse>
<polygon points="104,0 126,-14 126,-114 104,-100" fill="#9572D6"></polygon>
<polygon points="0,-100 22,-114 126,-114 104,-100" fill="#D6C2FF"></polygon>
<path d="M34 -126 h60" stroke-width="6"></path>
<rect x="22" y="-140" width="13" height="28" rx="3" fill="#FF7A59"></rect><rect x="93" y="-140" width="13" height="28" rx="3" fill="#FF7A59"></rect>
<rect x="0" y="-100" width="104" height="100" fill="#BC9AF5"></rect>
<rect x="10" y="-88" width="84" height="26" rx="3" fill="url(#glas)"></rect>
<path d="M16 -66 l10 -18 M50 -66 l10 -18" stroke="#FFFFFF" stroke-width="2.5" opacity="0.9"></path>
<rect x="8" y="-54" width="88" height="22" rx="6" fill="#FFFFFF" stroke-width="2.5"></rect>
<text x="52" y="-38" text-anchor="middle" font-family="Fredoka" font-weight="700" font-size="15" fill="#3A2E4F" stroke="none">Gymmet</text>
<rect x="38" y="-28" width="28" height="28" rx="2" fill="#5B3A9C"></rect>
</g>
<g transform="translate(1132,510)">
<ellipse cx="70" cy="4" rx="74" ry="9" fill="#2B2340" opacity="0.22" stroke="none" filter="url(#mjuk)"></ellipse>
<polygon points="104,0 126,-14 126,-110 104,-96" fill="#E08B70"></polygon>
<polygon points="0,-96 22,-110 126,-110 104,-96" fill="#FFD3C4"></polygon>
<rect x="0" y="-96" width="104" height="96" fill="#FFB59E"></rect>
<rect x="8" y="-88" width="88" height="22" rx="6" fill="#FFFFFF" stroke-width="2.5"></rect>
<text x="52" y="-72" text-anchor="middle" font-family="Fredoka" font-weight="700" font-size="15" fill="#3A2E4F" stroke="none">Kvickköp</text>
<rect x="-6" y="-60" width="116" height="10" fill="#FFFFFF" stroke="none"></rect>
<g fill="#FF5A5F" stroke="none"><rect x="-6" y="-60" width="19.3" height="10"></rect><rect x="32.6" y="-60" width="19.3" height="10"></rect><rect x="71.3" y="-60" width="19.3" height="10"></rect></g>
<path d="M-6 -50 a9.67 7 0 0 0 19.33 0 a9.67 7 0 0 0 19.33 0 a9.67 7 0 0 0 19.33 0 a9.67 7 0 0 0 19.33 0 a9.67 7 0 0 0 19.33 0 a9.67 7 0 0 0 19.33 0" fill="#FFFFFF" stroke-width="2.5"></path>
<rect x="-6" y="-60" width="116" height="10" fill="none"></rect>
<rect x="8" y="-38" width="46" height="30" rx="2" fill="url(#glas)"></rect>
<circle cx="18" cy="-14" r="5" fill="#FF5A5F" stroke-width="2"></circle><circle cx="30" cy="-12" r="5" fill="#FFD23F" stroke-width="2"></circle><circle cx="42" cy="-14" r="5" fill="#7BC35A" stroke-width="2"></circle>
<rect x="64" y="-36" width="30" height="36" rx="2" fill="#C2410C"></rect>
</g>
<g transform="translate(190,822)">
<ellipse cx="90" cy="4" rx="96" ry="10" fill="#2B2340" opacity="0.22" stroke="none" filter="url(#mjuk)"></ellipse>
<polygon points="140,0 162,-14 162,-110 140,-96" fill="#C98A45"></polygon>
<polygon points="70,-138 92,-152 170,-110 148,-96" fill="#7A4520"></polygon>
<rect x="0" y="-96" width="140" height="96" fill="#E9AE68"></rect>
<polygon points="-8,-96 70,-138 148,-96" fill="#9A5B2E"></polygon>
<circle cx="70" cy="-112" r="9" fill="url(#ljus)"></circle>
<rect x="14" y="-88" width="34" height="24" rx="2" fill="url(#ljus)"></rect><rect x="92" y="-88" width="34" height="24" rx="2" fill="url(#ljus)"></rect>
<path d="M14 -88 h10 l-10 16 z M48 -88 h-10 l10 16 z M92 -88 h10 l-10 16 z M126 -88 h-10 l10 16 z" fill="#D9534F" stroke-width="2"></path>
<rect x="6" y="-58" width="128" height="22" rx="6" fill="#FFFFFF" stroke-width="2.5"></rect>
<text x="70" y="-42" text-anchor="middle" font-family="Fredoka" font-weight="700" font-size="14" fill="#3A2E4F" stroke="none">Gyllene Ekorren</text>
<path d="M56 0 v-20 a14 12 0 0 1 28 0 v20 z" fill="#5A3A22"></path>
<path d="M140 -84 h22" stroke-width="3"></path>
<rect x="148" y="-80" width="18" height="22" rx="3" fill="#FFD23F" stroke-width="2.5"></rect><rect x="148" y="-80" width="18" height="7" rx="2" fill="#FFFFFF" stroke-width="2.5"></rect>
</g>
<g transform="translate(430,822)">
<ellipse cx="90" cy="4" rx="96" ry="10" fill="#2B2340" opacity="0.22" stroke="none" filter="url(#mjuk)"></ellipse>
<polygon points="140,0 162,-14 162,-118 140,-104" fill="#86C043"></polygon>
<polygon points="0,-104 22,-118 162,-118 140,-104" fill="#CBF29A"></polygon>
<path d="M70 -112 v-16 M106 -112 v-16" stroke-width="3"></path>
<circle cx="46" cy="-136" r="15" fill="#FFD23F"></circle><circle cx="46" cy="-136" r="5" fill="#CBF29A" stroke-width="2.5"></circle>
<path d="M61 -140 h56 v8 h-56 z M96 -132 v10 h6 v-10 M108 -132 v7 h6 v-7" fill="#FFD23F"></path>
<rect x="0" y="-104" width="140" height="104" fill="#AEE36A"></rect>
<rect x="16" y="-94" width="24" height="22" rx="2" fill="url(#glas)"></rect><rect x="58" y="-94" width="24" height="22" rx="2" fill="url(#ljus)"></rect><rect x="100" y="-94" width="24" height="22" rx="2" fill="url(#glas)"></rect>
<path d="M20 -76 l7 -12 M104 -76 l7 -12" stroke="#FFFFFF" stroke-width="2" opacity="0.9"></path>
<rect x="6" y="-62" width="128" height="22" rx="6" fill="#FFFFFF" stroke-width="2.5"></rect>
<text x="70" y="-46" text-anchor="middle" font-family="Fredoka" font-weight="700" font-size="14" fill="#3A2E4F" stroke="none">Bostadsbolaget</text>
<rect x="55" y="-32" width="30" height="32" rx="2" fill="#4B7A1E"></rect><circle cx="79" cy="-16" r="1.8" fill="#FFD23F" stroke="none"></circle>
</g>
<g transform="translate(670,822)">
<ellipse cx="90" cy="4" rx="96" ry="10" fill="#2B2340" opacity="0.22" stroke="none" filter="url(#mjuk)"></ellipse>
<polygon points="140,0 162,-14 162,-110 140,-96" fill="#DB6644"></polygon>
<polygon points="0,-96 22,-110 162,-110 140,-96" fill="#FFAE93"></polygon>
<path d="M70 -152 l-12 -14 M92 -152 l12 -14" stroke-width="3"></path>
<path d="M81 -104 v8" stroke-width="5"></path>
<rect x="44" y="-154" width="74" height="50" rx="9" fill="#3A2E4F"></rect>
<rect x="51" y="-147" width="60" height="36" rx="5" fill="url(#glas)" stroke="none"></rect>
<circle cx="72" cy="-134" r="3" fill="#3A2E4F" stroke="none"></circle><circle cx="90" cy="-134" r="3" fill="#3A2E4F" stroke="none"></circle>
<path d="M70 -124 q11 8 22 0" stroke-width="3" fill="none"></path>
<rect x="0" y="-96" width="140" height="96" fill="#FF8A66"></rect>
<rect x="10" y="-86" width="86" height="26" rx="3" fill="url(#glas)"></rect>
<path d="M16 -64 l10 -18 M50 -64 l10 -18" stroke="#FFFFFF" stroke-width="2.5" opacity="0.9"></path>
<g transform="translate(120,-80) rotate(-12)"><circle cx="0" cy="0" r="16" fill="#FFD23F"></circle><text x="0" y="4" text-anchor="middle" font-family="Fredoka" font-weight="700" font-size="11" fill="#3A2E4F" stroke="none">REA!</text></g>
<rect x="10" y="-52" width="120" height="22" rx="6" fill="#FFFFFF" stroke-width="2.5"></rect>
<text x="70" y="-36" text-anchor="middle" font-family="Fredoka" font-weight="700" font-size="15" fill="#3A2E4F" stroke="none">Prylpalatset</text>
<rect x="55" y="-26" width="30" height="26" rx="2" fill="#B23A1E"></rect>
</g>
<g transform="translate(910,822)">
<ellipse cx="90" cy="4" rx="96" ry="10" fill="#2B2340" opacity="0.22" stroke="none" filter="url(#mjuk)"></ellipse>
<polygon points="140,0 162,-14 162,-122 140,-108" fill="#237F74"></polygon>
<polygon points="0,-108 22,-122 162,-122 140,-108" fill="#63C9BC"></polygon>
<rect x="96" y="-138" width="38" height="22" rx="2" fill="#E8C48A"></rect><rect x="104" y="-156" width="26" height="18" rx="2" fill="#F2D3A0"></rect>
<path d="M115 -138 v22 M117 -156 v18" stroke="#C9A06A" stroke-width="3"></path>
<rect x="0" y="-108" width="140" height="108" fill="#34A99B"></rect>
<rect x="0" y="-96" width="140" height="12" fill="#FF8A3D"></rect>
<polygon points="140,-96 162,-110 162,-98 140,-84" fill="#D96A22"></polygon>
<rect x="6" y="-72" width="128" height="22" rx="6" fill="#FFFFFF" stroke-width="2.5"></rect>
<text x="70" y="-56" text-anchor="middle" font-family="Fredoka" font-weight="700" font-size="13" fill="#3A2E4F" stroke="none">Möbelmagasinet</text>
<rect x="46" y="-40" width="48" height="40" rx="2" fill="#1E6B62"></rect><path d="M70 -40 v40" stroke-width="2.5"></path>
</g>
</g></svg>`

export const PIXELSTADEN_SVG = `<svg width="100%" height="100%" preserveAspectRatio="xMidYMid meet" viewBox="0 0 1280 880" shape-rendering="crispEdges" role="img" aria-label="Pixelkarta med tio byggnader runt en ringväg och en park i mitten">
<defs>
<pattern id="gras" width="40" height="40" patternUnits="userSpaceOnUse">
<rect x="4" y="8" width="4" height="4" fill="#4E8F2E"></rect><rect x="24" y="28" width="4" height="4" fill="#4E8F2E"></rect><rect x="28" y="4" width="4" height="4" fill="#6CB848"></rect><rect x="12" y="32" width="4" height="4" fill="#6CB848"></rect>
</pattern>
<pattern id="park" width="24" height="24" patternUnits="userSpaceOnUse">
<rect x="0" y="0" width="24" height="24" fill="#79C24F"></rect><rect x="4" y="4" width="4" height="4" fill="#8FD162"></rect><rect x="16" y="14" width="4" height="4" fill="#6AB044"></rect>
</pattern>
</defs>
<rect x="0" y="0" width="1280" height="880" fill="url(#gras)"></rect>
<g transform="translate(0,40)">
<polygon points="224,222 1056,222 1056,246 1080,246 1080,270 1104,270 1104,294 1128,294 1128,606 1104,606 1104,630 1080,630 1080,654 1056,654 1056,678 224,678 224,654 200,654 200,630 176,630 176,606 152,606 152,294 176,294 176,270 200,270 200,246 224,246" fill="#B9B4A8"></polygon>
<polygon points="226,236 1054,236 1054,256 1074,256 1074,276 1094,276 1094,296 1114,296 1114,604 1094,604 1094,624 1074,624 1074,644 1054,644 1054,664 226,664 226,644 206,644 206,624 186,624 186,604 166,604 166,296 186,296 186,276 206,276 206,256 226,256" fill="#6B6B7B" stroke="#4A4A58" stroke-width="4"></polygon>
<polygon points="282,304 998,304 998,320 1014,320 1014,336 1030,336 1030,352 1046,352 1046,548 1030,548 1030,564 1014,564 1014,580 998,580 998,596 282,596 282,580 266,580 266,564 250,564 250,548 234,548 234,352 250,352 250,336 266,336 266,320 282,320" fill="#B9B4A8" stroke="#4A4A58" stroke-width="4"></polygon>
<polygon points="296,318 984,318 984,334 1000,334 1000,350 1016,350 1016,366 1032,366 1032,534 1016,534 1016,550 1000,550 1000,566 984,566 984,582 296,582 296,566 280,566 280,550 264,550 264,534 248,534 248,366 264,366 264,350 280,350 280,334 296,334" fill="url(#park)"></polygon>
<g stroke="#F2C94C" stroke-width="4" stroke-dasharray="16 16">
<line x1="256" y1="270" x2="1024" y2="270"></line>
<line x1="256" y1="630" x2="1024" y2="630"></line>
<line x1="200" y1="328" x2="200" y2="572"></line>
<line x1="1080" y1="328" x2="1080" y2="572"></line>
</g>
<g fill="#F5F1E6"><rect x="604" y="242" width="10" height="56"></rect><rect x="622" y="242" width="10" height="56"></rect><rect x="640" y="242" width="10" height="56"></rect><rect x="658" y="242" width="10" height="56"></rect></g>
<g transform="translate(880,532)"><rect x="0" y="0" width="112" height="32" fill="#1A1A2E"></rect><rect x="4" y="4" width="104" height="24" fill="#5DBDEB"></rect><g class="amb-shimmer"><rect x="16" y="8" width="24" height="4" fill="#FFFFFF"></rect><rect x="64" y="16" width="16" height="4" fill="#8FE3FF"></rect></g></g>
<g transform="translate(790,540)"><rect x="0" y="0" width="56" height="12" fill="#1A1A2E"></rect><rect x="4" y="4" width="48" height="4" fill="#C98A45"></rect><rect x="4" y="12" width="4" height="12" fill="#1A1A2E"></rect><rect x="48" y="12" width="4" height="12" fill="#1A1A2E"></rect></g>
<g>
<rect x="312" y="334" width="8" height="8" fill="#F07B9A" class="amb-twinkle" style="animation-delay:-2.3s"></rect><rect x="328" y="344" width="8" height="8" fill="#F2C94C" class="amb-twinkle" style="animation-delay:-4.6s"></rect><rect x="344" y="334" width="8" height="8" fill="#A07BE0" class="amb-twinkle" style="animation-delay:-6.9s"></rect>
<rect x="936" y="336" width="8" height="8" fill="#F2C94C" class="amb-twinkle" style="animation-delay:-0.2s"></rect><rect x="952" y="346" width="8" height="8" fill="#F07B9A" class="amb-twinkle" style="animation-delay:-2.5s"></rect><rect x="968" y="334" width="8" height="8" fill="#FFFFFF" class="amb-twinkle" style="animation-delay:-4.8s"></rect>
<rect x="316" y="548" width="8" height="8" fill="#FFFFFF" class="amb-twinkle" style="animation-delay:-7.1s"></rect><rect x="332" y="556" width="8" height="8" fill="#F07B9A" class="amb-twinkle" style="animation-delay:-0.4s"></rect><rect x="348" y="546" width="8" height="8" fill="#F2C94C" class="amb-twinkle" style="animation-delay:-2.7s"></rect>
<rect x="700" y="550" width="8" height="8" fill="#A07BE0" class="amb-twinkle" style="animation-delay:-5.0s"></rect><rect x="716" y="558" width="8" height="8" fill="#F2C94C" class="amb-twinkle" style="animation-delay:-7.3s"></rect>
</g>



<g transform="translate(84,154)"><g class="amb-sway" style="animation-delay:-1.7s"><rect x="8" y="0" width="32" height="8" fill="#2F7A2A"></rect><rect x="0" y="8" width="48" height="24" fill="#2F7A2A"></rect><rect x="8" y="32" width="32" height="8" fill="#2F7A2A"></rect><rect x="8" y="8" width="12" height="8" fill="#48A03C"></rect><rect x="18" y="40" width="12" height="16" fill="#6B3E1C"></rect></g></g>
<g transform="translate(366,154)"><g class="amb-sway" style="animation-delay:-3.4s"><rect x="8" y="0" width="32" height="8" fill="#2F7A2A"></rect><rect x="0" y="8" width="48" height="24" fill="#2F7A2A"></rect><rect x="8" y="32" width="32" height="8" fill="#2F7A2A"></rect><rect x="8" y="8" width="12" height="8" fill="#48A03C"></rect><rect x="18" y="40" width="12" height="16" fill="#6B3E1C"></rect></g></g>
<g transform="translate(606,154)"><g class="amb-sway" style="animation-delay:-5.1s"><rect x="8" y="0" width="32" height="8" fill="#2F7A2A"></rect><rect x="0" y="8" width="48" height="24" fill="#2F7A2A"></rect><rect x="8" y="32" width="32" height="8" fill="#2F7A2A"></rect><rect x="8" y="8" width="12" height="8" fill="#48A03C"></rect><rect x="18" y="40" width="12" height="16" fill="#6B3E1C"></rect></g></g>
<g transform="translate(846,154)"><g class="amb-sway" style="animation-delay:-6.8s"><rect x="8" y="0" width="32" height="8" fill="#2F7A2A"></rect><rect x="0" y="8" width="48" height="24" fill="#2F7A2A"></rect><rect x="8" y="32" width="32" height="8" fill="#2F7A2A"></rect><rect x="8" y="8" width="12" height="8" fill="#48A03C"></rect><rect x="18" y="40" width="12" height="16" fill="#6B3E1C"></rect></g></g>
<g transform="translate(1156,154)"><g class="amb-sway" style="animation-delay:-1.5s"><rect x="8" y="0" width="32" height="8" fill="#2F7A2A"></rect><rect x="0" y="8" width="48" height="24" fill="#2F7A2A"></rect><rect x="8" y="32" width="32" height="8" fill="#2F7A2A"></rect><rect x="8" y="8" width="12" height="8" fill="#48A03C"></rect><rect x="18" y="40" width="12" height="16" fill="#6B3E1C"></rect></g></g>
<g transform="translate(56,580)"><g class="amb-sway" style="animation-delay:-3.2s"><rect x="8" y="0" width="32" height="8" fill="#2F7A2A"></rect><rect x="0" y="8" width="48" height="24" fill="#2F7A2A"></rect><rect x="8" y="32" width="32" height="8" fill="#2F7A2A"></rect><rect x="8" y="8" width="12" height="8" fill="#48A03C"></rect><rect x="18" y="40" width="12" height="16" fill="#6B3E1C"></rect></g></g>
<g transform="translate(1180,580)"><g class="amb-sway" style="animation-delay:-4.9s"><rect x="8" y="0" width="32" height="8" fill="#2F7A2A"></rect><rect x="0" y="8" width="48" height="24" fill="#2F7A2A"></rect><rect x="8" y="32" width="32" height="8" fill="#2F7A2A"></rect><rect x="8" y="8" width="12" height="8" fill="#48A03C"></rect><rect x="18" y="40" width="12" height="16" fill="#6B3E1C"></rect></g></g>
<g transform="translate(366,766)"><g class="amb-sway" style="animation-delay:-6.6s"><rect x="8" y="0" width="32" height="8" fill="#2F7A2A"></rect><rect x="0" y="8" width="48" height="24" fill="#2F7A2A"></rect><rect x="8" y="32" width="32" height="8" fill="#2F7A2A"></rect><rect x="8" y="8" width="12" height="8" fill="#48A03C"></rect><rect x="18" y="40" width="12" height="16" fill="#6B3E1C"></rect></g></g>
<g transform="translate(606,766)"><g class="amb-sway" style="animation-delay:-1.3s"><rect x="8" y="0" width="32" height="8" fill="#2F7A2A"></rect><rect x="0" y="8" width="48" height="24" fill="#2F7A2A"></rect><rect x="8" y="32" width="32" height="8" fill="#2F7A2A"></rect><rect x="8" y="8" width="12" height="8" fill="#48A03C"></rect><rect x="18" y="40" width="12" height="16" fill="#6B3E1C"></rect></g></g>
<g transform="translate(846,766)"><g class="amb-sway" style="animation-delay:-3.0s"><rect x="8" y="0" width="32" height="8" fill="#2F7A2A"></rect><rect x="0" y="8" width="48" height="24" fill="#2F7A2A"></rect><rect x="8" y="32" width="32" height="8" fill="#2F7A2A"></rect><rect x="8" y="8" width="12" height="8" fill="#48A03C"></rect><rect x="18" y="40" width="12" height="16" fill="#6B3E1C"></rect></g></g>
<g transform="translate(100,766)"><g class="amb-sway" style="animation-delay:-4.7s"><rect x="8" y="0" width="32" height="8" fill="#2F7A2A"></rect><rect x="0" y="8" width="48" height="24" fill="#2F7A2A"></rect><rect x="8" y="32" width="32" height="8" fill="#2F7A2A"></rect><rect x="8" y="8" width="12" height="8" fill="#48A03C"></rect><rect x="18" y="40" width="12" height="16" fill="#6B3E1C"></rect></g></g>
<g transform="translate(1140,766)"><g class="amb-sway" style="animation-delay:-6.4s"><rect x="8" y="0" width="32" height="8" fill="#2F7A2A"></rect><rect x="0" y="8" width="48" height="24" fill="#2F7A2A"></rect><rect x="8" y="32" width="32" height="8" fill="#2F7A2A"></rect><rect x="8" y="8" width="12" height="8" fill="#48A03C"></rect><rect x="18" y="40" width="12" height="16" fill="#6B3E1C"></rect></g></g>
<g transform="translate(190,82)">
<rect x="0" y="0" width="160" height="130" fill="#1A1A2E"></rect><rect x="4" y="4" width="152" height="32" fill="#8E3B66"></rect><rect x="4" y="4" width="152" height="8" fill="#B2577F"></rect>
<rect x="4" y="36" width="152" height="90" fill="#E88AB0"></rect><rect x="132" y="36" width="24" height="90" fill="#C0628A"></rect>
<rect x="14" y="44" width="116" height="26" fill="#FFF4D6"></rect><rect x="14" y="66" width="116" height="4" fill="#D9C9A3"></rect>
<text x="72" y="63" text-anchor="middle" font-family="VT323" font-size="22" fill="#1A1A2E">LÄGENHET</text>
<rect x="18" y="80" width="28" height="24" fill="#1A1A2E"></rect><rect x="22" y="84" width="20" height="16" fill="#FFD95A" class="amb-lamp"></rect><rect x="22" y="84" width="6" height="6" fill="#FFFFFF"></rect>
<rect x="96" y="80" width="28" height="24" fill="#1A1A2E"></rect><rect x="100" y="84" width="20" height="16" fill="#8FE3FF"></rect><rect x="100" y="84" width="6" height="6" fill="#FFFFFF"></rect>
<rect x="56" y="86" width="32" height="40" fill="#1A1A2E"></rect><rect x="60" y="90" width="24" height="36" fill="#5A2A44"></rect><rect x="78" y="106" width="4" height="4" fill="#F2C94C"></rect>
</g>
<g transform="translate(430,82)">
<g class="amb-bob"><rect x="64" y="-40" width="32" height="32" fill="#1A1A2E"></rect><rect x="68" y="-36" width="24" height="24" fill="#F2C94C"></rect><rect x="78" y="-32" width="4" height="10" fill="#1A1A2E"></rect><rect x="78" y="-18" width="4" height="4" fill="#1A1A2E"></rect></g>
<rect x="0" y="0" width="160" height="130" fill="#1A1A2E"></rect><rect x="4" y="4" width="152" height="32" fill="#2D4F8F"></rect><rect x="4" y="4" width="152" height="8" fill="#4567AD"></rect>
<rect x="4" y="36" width="152" height="90" fill="#5B8FD9"></rect><rect x="132" y="36" width="24" height="90" fill="#3D6DB5"></rect>
<rect x="14" y="44" width="116" height="26" fill="#FFF4D6"></rect><rect x="14" y="66" width="116" height="4" fill="#D9C9A3"></rect>
<text x="72" y="63" text-anchor="middle" font-family="VT323" font-size="22" fill="#1A1A2E">JOBBTORGET</text>
<rect x="18" y="80" width="28" height="24" fill="#1A1A2E"></rect><rect x="22" y="84" width="20" height="16" fill="#8FE3FF"></rect><rect x="22" y="84" width="6" height="6" fill="#FFFFFF"></rect>
<rect x="96" y="80" width="28" height="24" fill="#1A1A2E"></rect><rect x="100" y="84" width="20" height="16" fill="#8FE3FF"></rect><rect x="100" y="84" width="6" height="6" fill="#FFFFFF"></rect>
<rect x="56" y="86" width="32" height="40" fill="#1A1A2E"></rect><rect x="60" y="90" width="24" height="36" fill="#1E3560"></rect><rect x="78" y="106" width="4" height="4" fill="#F2C94C"></rect>
</g>
<g transform="translate(670,82)">
<rect x="0" y="0" width="160" height="130" fill="#1A1A2E"></rect><rect x="4" y="4" width="152" height="32" fill="#A0742A"></rect><rect x="4" y="4" width="152" height="8" fill="#BF8E3A"></rect>
<rect x="4" y="36" width="152" height="90" fill="#F2C94C"></rect><rect x="132" y="36" width="24" height="90" fill="#C9A12E"></rect>
<rect x="14" y="44" width="116" height="26" fill="#FFF4D6"></rect><rect x="14" y="66" width="116" height="4" fill="#D9C9A3"></rect>
<text x="72" y="63" text-anchor="middle" font-family="VT323" font-size="22" fill="#1A1A2E">HÖGSKOLAN</text>
<rect x="18" y="76" width="12" height="50" fill="#FFFFFF"></rect><rect x="40" y="76" width="12" height="50" fill="#FFFFFF"></rect><rect x="96" y="76" width="12" height="50" fill="#FFFFFF"></rect><rect x="116" y="76" width="12" height="50" fill="#FFFFFF"></rect>
<rect x="26" y="76" width="4" height="50" fill="#D9D2C0"></rect><rect x="48" y="76" width="4" height="50" fill="#D9D2C0"></rect><rect x="104" y="76" width="4" height="50" fill="#D9D2C0"></rect><rect x="124" y="76" width="4" height="50" fill="#D9D2C0"></rect>
<rect x="56" y="86" width="32" height="40" fill="#1A1A2E"></rect><rect x="60" y="90" width="24" height="36" fill="#6B4A1A"></rect><rect x="78" y="106" width="4" height="4" fill="#F2C94C"></rect>
</g>
<g transform="translate(910,82)">
<g class="amb-wobble"><rect x="64" y="-28" width="32" height="8" fill="#6B3E1C"></rect><rect x="60" y="-20" width="40" height="8" fill="#6B3E1C"></rect><rect x="64" y="-12" width="32" height="12" fill="#D9A066"></rect><rect x="76" y="-36" width="8" height="8" fill="#6B3E1C"></rect><rect x="68" y="-10" width="6" height="6" fill="#F2D3A0"></rect></g>
<rect x="0" y="0" width="160" height="130" fill="#1A1A2E"></rect><rect x="4" y="4" width="152" height="32" fill="#22735F"></rect><rect x="4" y="4" width="152" height="8" fill="#2E8C74"></rect>
<rect x="4" y="36" width="152" height="90" fill="#4CC2A6"></rect><rect x="132" y="36" width="24" height="90" fill="#2F9C82"></rect>
<rect x="14" y="44" width="116" height="26" fill="#FFF4D6"></rect><rect x="14" y="66" width="116" height="4" fill="#D9C9A3"></rect>
<text x="72" y="63" text-anchor="middle" font-family="VT323" font-size="22" fill="#1A1A2E">BANKEN</text>
<rect x="18" y="80" width="28" height="24" fill="#1A1A2E"></rect><rect x="22" y="84" width="20" height="16" fill="#8FE3FF"></rect><rect x="22" y="84" width="6" height="6" fill="#FFFFFF"></rect>
<rect x="96" y="80" width="28" height="24" fill="#1A1A2E"></rect><rect x="100" y="84" width="20" height="16" fill="#8FE3FF"></rect><rect x="100" y="84" width="6" height="6" fill="#FFFFFF"></rect>
<rect x="56" y="86" width="32" height="40" fill="#1A1A2E"></rect><rect x="60" y="90" width="24" height="36" fill="#164D40"></rect><rect x="68" y="100" width="8" height="8" fill="#F2C94C"></rect>
</g>
<g transform="translate(16,380)">
<g class="amb-lift"><rect x="24" y="-20" width="80" height="8" fill="#1A1A2E"></rect><rect x="16" y="-32" width="16" height="32" fill="#1A1A2E"></rect><rect x="20" y="-28" width="8" height="24" fill="#F07B5A"></rect><rect x="96" y="-32" width="16" height="32" fill="#1A1A2E"></rect><rect x="100" y="-28" width="8" height="24" fill="#F07B5A"></rect></g>
<rect x="0" y="0" width="128" height="130" fill="#1A1A2E"></rect><rect x="4" y="4" width="120" height="32" fill="#573A8F"></rect><rect x="4" y="4" width="120" height="8" fill="#6E4FAA"></rect>
<rect x="4" y="36" width="120" height="90" fill="#A07BE0"></rect><rect x="100" y="36" width="24" height="90" fill="#7E59BF"></rect>
<rect x="10" y="44" width="100" height="26" fill="#FFF4D6"></rect><rect x="10" y="66" width="100" height="4" fill="#D9C9A3"></rect>
<text x="60" y="63" text-anchor="middle" font-family="VT323" font-size="20" fill="#1A1A2E">GYMMET</text>
<rect x="12" y="80" width="24" height="24" fill="#1A1A2E"></rect><rect x="16" y="84" width="16" height="16" fill="#8FE3FF"></rect><rect x="16" y="84" width="6" height="6" fill="#FFFFFF"></rect>
<rect x="70" y="80" width="24" height="24" fill="#1A1A2E"></rect><rect x="74" y="84" width="16" height="16" fill="#8FE3FF"></rect><rect x="74" y="84" width="6" height="6" fill="#FFFFFF"></rect>
<rect x="40" y="86" width="26" height="40" fill="#1A1A2E"></rect><rect x="44" y="90" width="18" height="36" fill="#3A2560"></rect><rect x="56" y="106" width="4" height="4" fill="#F2C94C"></rect>
</g>
<g transform="translate(1136,380)">
<rect x="0" y="0" width="128" height="130" fill="#1A1A2E"></rect><rect x="4" y="4" width="120" height="32" fill="#8F3520"></rect><rect x="4" y="4" width="120" height="8" fill="#A9452C"></rect>
<rect x="4" y="36" width="120" height="90" fill="#F07B5A"></rect><rect x="100" y="36" width="24" height="90" fill="#C95A3C"></rect>
<rect x="10" y="44" width="100" height="26" fill="#FFF4D6"></rect><rect x="10" y="66" width="100" height="4" fill="#D9C9A3"></rect>
<text x="60" y="63" text-anchor="middle" font-family="VT323" font-size="20" fill="#1A1A2E">KVICKKÖP</text>
<rect x="4" y="72" width="96" height="8" fill="#FFFFFF"></rect><rect x="4" y="72" width="16" height="8" fill="#E04848"></rect><rect x="36" y="72" width="16" height="8" fill="#E04848"></rect><rect x="68" y="72" width="16" height="8" fill="#E04848"></rect>
<rect x="12" y="84" width="24" height="24" fill="#1A1A2E"></rect><rect x="16" y="88" width="16" height="16" fill="#8FE3FF"></rect><rect x="16" y="96" width="4" height="4" fill="#E04848"></rect><rect x="24" y="96" width="4" height="4" fill="#F2C94C"></rect>
<rect x="70" y="84" width="24" height="24" fill="#1A1A2E"></rect><rect x="74" y="88" width="16" height="16" fill="#8FE3FF"></rect><rect x="78" y="96" width="4" height="4" fill="#8CCB4F"></rect>
<rect x="40" y="86" width="26" height="40" fill="#1A1A2E"></rect><rect x="44" y="90" width="18" height="36" fill="#5A1F10"></rect><rect x="56" y="106" width="4" height="4" fill="#F2C94C"></rect>
</g>
<g transform="translate(190,692)">
<rect x="0" y="0" width="160" height="130" fill="#1A1A2E"></rect><rect x="4" y="4" width="152" height="32" fill="#6B3E1C"></rect><rect x="4" y="4" width="152" height="8" fill="#83502A"></rect>
<rect x="4" y="36" width="152" height="90" fill="#C98A4B"></rect><rect x="132" y="36" width="24" height="90" fill="#A26A30"></rect>
<rect x="14" y="44" width="116" height="26" fill="#FFF4D6"></rect><rect x="14" y="66" width="116" height="4" fill="#D9C9A3"></rect>
<text x="72" y="63" text-anchor="middle" font-family="VT323" font-size="22" fill="#1A1A2E">PUBEN</text>
<rect x="18" y="80" width="28" height="24" fill="#1A1A2E"></rect><rect x="22" y="84" width="20" height="16" fill="#FFD95A" class="amb-glow"></rect><rect x="22" y="84" width="6" height="6" fill="#FFFFFF"></rect>
<rect x="96" y="80" width="28" height="24" fill="#1A1A2E"></rect><rect x="100" y="84" width="20" height="16" fill="#FFD95A" class="amb-glow" style="animation-delay:-2s"></rect><rect x="100" y="84" width="6" height="6" fill="#FFFFFF"></rect>
<rect x="56" y="86" width="32" height="40" fill="#1A1A2E"></rect><rect x="60" y="90" width="24" height="36" fill="#3D2210"></rect><rect x="78" y="106" width="4" height="4" fill="#F2C94C"></rect>
<g class="amb-swing"><rect x="156" y="50" width="12" height="4" fill="#1A1A2E"></rect><rect x="160" y="54" width="16" height="20" fill="#1A1A2E"></rect><rect x="164" y="62" width="8" height="8" fill="#F2C94C"></rect><rect x="164" y="58" width="8" height="4" fill="#FFFFFF"></rect></g>
</g>
<g transform="translate(430,692)">
<rect x="0" y="0" width="160" height="130" fill="#1A1A2E"></rect><rect x="4" y="4" width="152" height="32" fill="#46751F"></rect><rect x="4" y="4" width="152" height="8" fill="#578F2A"></rect>
<rect x="4" y="36" width="152" height="90" fill="#8CCB4F"></rect><rect x="132" y="36" width="24" height="90" fill="#69A62F"></rect>
<rect x="14" y="44" width="116" height="26" fill="#FFF4D6"></rect><rect x="14" y="66" width="116" height="4" fill="#D9C9A3"></rect>
<text x="72" y="63" text-anchor="middle" font-family="VT323" font-size="22" fill="#1A1A2E">BOSTAD</text>
<rect x="18" y="80" width="28" height="24" fill="#1A1A2E"></rect><rect x="22" y="84" width="20" height="16" fill="#8FE3FF"></rect><rect x="22" y="84" width="6" height="6" fill="#FFFFFF"></rect>
<rect x="96" y="80" width="28" height="24" fill="#1A1A2E"></rect><rect x="100" y="84" width="20" height="16" fill="#FFD95A" class="amb-lamp" style="animation-delay:-23s;animation-duration:41s"></rect><rect x="100" y="84" width="6" height="6" fill="#FFFFFF"></rect>
<rect x="56" y="86" width="32" height="40" fill="#1A1A2E"></rect><rect x="60" y="90" width="24" height="36" fill="#2A4712"></rect><rect x="78" y="106" width="4" height="4" fill="#F2C94C"></rect>
</g>
<g transform="translate(670,692)">
<rect x="0" y="0" width="160" height="130" fill="#1A1A2E"></rect><rect x="4" y="4" width="152" height="32" fill="#8F5512"></rect><rect x="4" y="4" width="152" height="8" fill="#A86818"></rect>
<rect x="4" y="36" width="152" height="90" fill="#F0A23B"></rect><rect x="132" y="36" width="24" height="90" fill="#C77F1E"></rect>
<rect x="14" y="44" width="116" height="26" fill="#FFF4D6"></rect><rect x="14" y="66" width="116" height="4" fill="#D9C9A3"></rect>
<text x="72" y="63" text-anchor="middle" font-family="VT323" font-size="22" fill="#1A1A2E">PRYLPALATS</text>
<rect x="18" y="80" width="28" height="24" fill="#1A1A2E"></rect><rect x="22" y="84" width="20" height="16" fill="#8FE3FF"></rect><rect x="22" y="84" width="6" height="6" fill="#FFFFFF"></rect>
<rect x="92" y="78" width="36" height="28" fill="#1A1A2E"></rect><rect x="96" y="82" width="28" height="20" fill="#8FE3FF"></rect><g class="amb-blink"><rect x="102" y="86" width="4" height="4" fill="#1A1A2E"></rect><rect x="114" y="86" width="4" height="4" fill="#1A1A2E"></rect></g><rect x="102" y="96" width="16" height="4" fill="#1A1A2E"></rect>
<rect x="56" y="86" width="32" height="40" fill="#1A1A2E"></rect><rect x="60" y="90" width="24" height="36" fill="#5A340A"></rect><rect x="78" y="106" width="4" height="4" fill="#F2C94C"></rect>
</g>
<g transform="translate(910,692)">
<rect x="0" y="0" width="160" height="130" fill="#1A1A2E"></rect><rect x="4" y="4" width="152" height="32" fill="#3E4766"></rect><rect x="4" y="4" width="152" height="8" fill="#4F5A7E"></rect>
<rect x="4" y="36" width="152" height="90" fill="#7C8BB0"></rect><rect x="132" y="36" width="24" height="90" fill="#5E6C91"></rect>
<rect x="14" y="44" width="116" height="26" fill="#FFF4D6"></rect><rect x="14" y="66" width="116" height="4" fill="#D9C9A3"></rect>
<text x="72" y="63" text-anchor="middle" font-family="VT323" font-size="22" fill="#1A1A2E">MÖBLER</text>
<rect x="14" y="82" width="36" height="26" fill="#1A1A2E"></rect><rect x="18" y="86" width="28" height="18" fill="#D9A066"></rect><rect x="18" y="94" width="28" height="4" fill="#A86818"></rect>
<rect x="94" y="82" width="32" height="26" fill="#1A1A2E"></rect><rect x="98" y="86" width="24" height="18" fill="#D9A066"></rect>
<rect x="56" y="86" width="32" height="40" fill="#1A1A2E"></rect><rect x="60" y="90" width="24" height="36" fill="#262C40"></rect><rect x="78" y="106" width="4" height="4" fill="#F2C94C"></rect>
</g>
</g></svg>`
