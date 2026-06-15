-- AUTO-GERADO (gen_fill.mjs): popula o banco com o conteúdo atual da LP v4
-- que hoje só existe como default no código. 'novo || existente' => nunca
-- sobrescreve o que já está no banco; só preenche o que falta.
begin;
update public.landing_sections set
  texts = jsonb_build_object('title', 'Descubra o que o <span class="cms-orange">Manual</span> ensina aos compradores e entenda as <span class="cms-orange">novas regras do jogo.</span>') || texts,
  texts_draft = jsonb_build_object('title', 'Descubra o que o <span class="cms-orange">Manual</span> ensina aos compradores e entenda as <span class="cms-orange">novas regras do jogo.</span>') || coalesce(texts_draft, texts),
  updated_at = now()
where section_id = 'video';
update public.landing_sections set
  texts = jsonb_build_object('faq4Question', 'Preciso ter conhecimento técnico para aproveitar o Manual?', 'faq4Answer', 'Não. O Manual foi escrito para orientar decisões, não para formar engenheiros. Os 160 tópicos são organizados para consulta rápida, em linguagem direta, e os anexos técnicos aprofundam quem quiser ir além. Vendedores iniciantes e compradores leigos acompanham sem dificuldade.', 'faq5Question', 'Em que formato recebo o material?', 'faq5Answer', 'O Manual Solar Buy-Side e o Código do Vendedor Consultivo chegam em PDF interativo, com índice navegável. Você lê no celular, tablet ou computador, online ou offline. O link de acesso chega no e-mail cadastrado logo após a confirmação do pagamento.', 'faq6Question', 'Como funciona o acesso à Plataforma de Avaliação de Propostas?', 'faq6Answer', 'A compra do Manual libera automaticamente o acesso à plataforma por 6 meses. Nela você compara propostas de fornecedores lado a lado, com pontuação por reputação, tecnologia e viabilidade e o Índice de Confiabilidade de 0 a 100.', 'faq7Question', 'Posso comprar para a minha equipe comercial?', 'faq7Answer', 'Sim. A oferta inclui a Licença de Uso Coletiva: até 10 cópias para o mesmo CNPJ, pagando uma única vez. É o formato pensado para integradoras que querem padronizar a abordagem do time inteiro.') || texts,
  texts_draft = jsonb_build_object('faq4Question', 'Preciso ter conhecimento técnico para aproveitar o Manual?', 'faq4Answer', 'Não. O Manual foi escrito para orientar decisões, não para formar engenheiros. Os 160 tópicos são organizados para consulta rápida, em linguagem direta, e os anexos técnicos aprofundam quem quiser ir além. Vendedores iniciantes e compradores leigos acompanham sem dificuldade.', 'faq5Question', 'Em que formato recebo o material?', 'faq5Answer', 'O Manual Solar Buy-Side e o Código do Vendedor Consultivo chegam em PDF interativo, com índice navegável. Você lê no celular, tablet ou computador, online ou offline. O link de acesso chega no e-mail cadastrado logo após a confirmação do pagamento.', 'faq6Question', 'Como funciona o acesso à Plataforma de Avaliação de Propostas?', 'faq6Answer', 'A compra do Manual libera automaticamente o acesso à plataforma por 6 meses. Nela você compara propostas de fornecedores lado a lado, com pontuação por reputação, tecnologia e viabilidade e o Índice de Confiabilidade de 0 a 100.', 'faq7Question', 'Posso comprar para a minha equipe comercial?', 'faq7Answer', 'Sim. A oferta inclui a Licença de Uso Coletiva: até 10 cópias para o mesmo CNPJ, pagando uma única vez. É o formato pensado para integradoras que querem padronizar a abordagem do time inteiro.') || coalesce(texts_draft, texts),
  updated_at = now()
where section_id = 'faq';
update public.landing_sections set
  texts = jsonb_build_object('title', 'Novidades do mercado solar, direto no e-mail') || texts,
  texts_draft = jsonb_build_object('title', 'Novidades do mercado solar, direto no e-mail') || coalesce(texts_draft, texts),
  updated_at = now()
where section_id = 'newsletter';
update public.landing_sections set
  images = jsonb_build_object('francis', '/assets/Francis Poloni LP PRO.jpg.jpeg', 'ovidio', '/assets/Ovídio2.png') || coalesce(images, '{}'::jsonb),
  images_draft = jsonb_build_object('francis', '/assets/Francis Poloni LP PRO.jpg.jpeg', 'ovidio', '/assets/Ovídio2.png') || coalesce(images_draft, images, '{}'::jsonb),
  updated_at = now()
where section_id = 'authority';
update public.landing_sections set
  images = jsonb_build_object('manualImage', '/assets/Manual de Compra -OF.png', 'testimonialImage', '/assets/Integrador_Rodrigo_SP.png') || coalesce(images, '{}'::jsonb),
  images_draft = jsonb_build_object('manualImage', '/assets/Manual de Compra -OF.png', 'testimonialImage', '/assets/Integrador_Rodrigo_SP.png') || coalesce(images_draft, images, '{}'::jsonb),
  updated_at = now()
where section_id = 'story-bridge';
commit;
