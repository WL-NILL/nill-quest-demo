VAR visitor_identity = "unset"
VAR visitor_motive = "unset"

VAR identity_conflict = false
VAR motive_conflict = false
VAR edward_conflict = false

VAR memory_strain = 0
VAR strain_reason = "none"
VAR first_resolution = "unset"
VAR edward_resolution = "unset"
VAR checkpoint_doubt = 0
VAR checkpoint_delusion = 0
VAR checkpoint_fracture = 0
VAR checkpoint_memory_strain = 0
VAR checkpoint_strain_reason = "none"


=== restore_fight_checkpoint ===
~ doubt = checkpoint_doubt
~ delusion = checkpoint_delusion
~ fracture = checkpoint_fracture
~ memory_strain = checkpoint_memory_strain
~ strain_reason = checkpoint_strain_reason
# music:start fight_memory
# music:fade 1200
# music:volume 0.34
-> fight_first_choice


=== chapter_02_fight ===

# layer:archive
# line:fight_title
# music:start fight_ambient
# music:fade 2400
# music:volume 0.28
# pause:2000
ГЛАВА II
# beat:end


# layer:narration
# line:fight_opening_01
Конец драки держался в памяти лучше начала.
# beat:end

# layer:narration
# line:fight_opening_02
Нилл помнил, где лежал посетитель, где стоял опрокинутый стул и как Эдвард держал салфетку у губы.
# beat:end

# layer:narration
# line:fight_opening_03
Начало возвращалось по частям.
# beat:end

# layer:thought
# line:fight_opening_04
Каждая деталь казалась правильной.
# beat:end

# layer:thought
# line:fight_opening_05
...Но вместе они не складывались.
# beat:end


# layer:narration
# line:fight_bar_01
Сам бар пока держался на месте.
# beat:end

# layer:narration
# line:fight_bar_02
Столы стояли там, где должны были. Стойка тянулась вдоль стены. Лампы низко висели над головами.
# beat:end

# layer:narration
# line:fight_bar_02b
Люди спорили, двигали стулья, тянулись к пепельницам.
# beat:end

# layer:unknown
# line:fight_bar_02c
Иногда ему казалось, что движение происходило раньше.
# beat:end

# layer:thought
# line:fight_bar_02d
А звук догонял позже.
# beat:end

# layer:unknown
# line:fight_bar_03
Мужчина у стойки рассмеялся.
# beat:end

# layer:thought
# line:fight_bar_04
Нилл не услышал смеха.
# beat:end

# layer:narration
# line:fight_bar_05
Хриплый смешок донёсся из другого конца зала.
# beat:end


# layer:narration
# line:fight_edward_door_01
Эдвард стоял у двери.
# beat:end

# layer:thought
# line:fight_edward_door_02
# memory:flicker
Или ещё только шёл к ней.
# beat:end


# layer:narration
# line:fight_body_01
Вино грело лицо и затылок.
# beat:end

# layer:narration
# line:fight_body_02
До пальцев тепло не дошло.
# beat:end

# layer:thought
# line:fight_body_03
Два из пяти Нилл почти не чувствовал.
# beat:end

# layer:narration
# line:fight_body_04
Он разжал кулак и согнул каждый палец.
# beat:end

# layer:thought
# line:fight_body_05
Все пять были на месте. Двигались неохотно.
# beat:end

# layer:narration
# line:fight_body_06
На костяшке засохла тонкая полоска крови.
# beat:end

# layer:thought
# line:fight_body_07
Своя.
# beat:end

# layer:thought
# line:fight_body_08
Наверное.
# beat:end


# layer:narration
# line:fight_visitor_01
Посетитель вошёл вместе с запахом дождя и мокрой ткани.
# beat:end

# layer:narration
# line:fight_visitor_02
С воротника капало на пол.
# beat:end

# layer:narration
# line:fight_visitor_02b
# sfx:visitor-step-01
Подошвы оставляли тёмные следы между столами.
# beat:end

# layer:narration
# line:fight_visitor_02c
Он поправил рукав у запястья.

# layer:narration
# line:fight_visitor_02d
Мокрая ткань цеплялась за кожу.
# beat:end

# layer:narration
# line:fight_visitor_03
Возраст на его лице не держался.
# beat:end

# layer:thought
# line:fight_visitor_03b
То немного за тридцать. То уже за сорок.
# beat:end

# layer:narration
# line:fight_visitor_03c
Тяжёлая челюсть, щетина, белёсый шрам у подбородка.
# beat:end

# layer:narration
# line:fight_visitor_04
Костяшки правой руки были сбиты.
# beat:end

# layer:narration
# line:fight_visitor_05
Под ногтями засохла серо-синяя пыль.
# beat:end

# layer:thought
# line:fight_visitor_05b
Складская краска.
# beat:end

# layer:thought
# line:fight_visitor_05c
Может, металлическая стружка.
# beat:end

# layer:thought
# line:fight_visitor_05d
Может, обычная грязь.
# beat:end

# layer:narration
# line:fight_visitor_06
# alternate:знак=пятно
На плече куртки темнел выцветший знак.
# beat:end

# layer:thought
# line:fight_visitor_07
Нилл его узнал.
# beat:end

# layer:unknown
# line:fight_visitor_08
# memory:flicker
Рассмотреть знак он ещё не успел.
# beat:end

# debug-choice:significant
+ [Знак старой грузовой компании.]
~ visitor_identity = "worker"

# layer:thought
# line:fight_identity_worker_01
На таком складе знали, куда ушла каждая коробка.

# layer:thought
# line:fight_identity_worker_01b
С людьми было хуже.
# beat:end

# layer:thought
# line:fight_identity_worker_02
Лица Нилл не помнил.

# layer:thought
# line:fight_identity_worker_02b
Рабочие менялись каждую неделю.
# beat:end

-> visitor_approaches

+ [Знак службы взыскания.]
~ visitor_identity = "collector"

# layer:thought
# line:fight_identity_collector_01
С такими нашивками приходили за деньгами.

# layer:thought
# line:fight_identity_collector_01b
Или за тем, что можно было забрать вместо них.
# beat:end

# layer:thought
# line:fight_identity_collector_02
Нилл не мог сразу решить, кому успел столько задолжать.
# beat:end

-> visitor_approaches

+ [Обычная потёртость.]
~ visitor_identity = "stranger"

# layer:thought
# line:fight_identity_stranger_01
Знака не было. Только выцветшая ткань.

# layer:narration
# line:fight_identity_stranger_01b
Ткань выцвела от дождя и дешёвого порошка.
# beat:end

# layer:thought
# line:fight_identity_stranger_02
Нилл всё равно продолжал смотреть на плечо.
# beat:end

-> visitor_approaches


=== visitor_approaches ===

# layer:narration
# line:fight_visitor_09
Посетитель остановился у стойки.

# beat:end

# layer:narration
# line:fight_visitor_10
Он оглядел бар, будто проверял, кто здесь ещё остался.

# beat:end

# layer:narration
# line:fight_visitor_11
Его взгляд задержался на Эдварде.

# beat:end


# layer:dialogue
# speaker:edward
# line:fight_edward_close
\- Закрываемся.
# beat:end


# layer:dialogue
# speaker:visitor
# line:fight_visitor_not_you
\- Я не к тебе.
# beat:end


# layer:narration
# line:fight_visitor_look
Он посмотрел на Нилла без узнавания. Ждал, что узнает Нилл.
# beat:end


# layer:dialogue
# speaker:visitor
# line:fight_visitor_name
\- Ты ведь Нилл?
# beat:end


# layer:unknown
# line:fight_visitor_name_echo_01
Нилл не понял интонацию.

# layer:unknown
# line:fight_visitor_name_echo_02
Вопрос мог быть осторожным. Мог быть угрозой.
# beat:end

# layer:unknown
# line:fight_visitor_name_echo_03
# memory:flicker
Через секунду Нилл уже помнил оба варианта.
# beat:end

# layer:narration
# line:fight_paper_01
Посетитель полез во внутренний карман.
# beat:end

# layer:narration
# line:fight_paper_02
Куртка натянулась на плече.

# layer:unknown
# line:fight_paper_03
Знак исчез в складке.
# beat:end

# layer:narration
# line:fight_paper_04
Он достал сложенный вчетверо лист.

# layer:narration
# line:fight_paper_05
Края листа размокли и липли к пальцам.
# beat:end


# debug-choice:significant
+ [Это была складская накладная.]
~ visitor_motive = "inventory"

# layer:thought
# line:fight_motive_inventory_01
В верхней строке стоял знакомый номер партии.

# layer:thought
# line:fight_motive_inventory_02
Такой номер Нилл однажды переписал на клочок бумаги, а потом выбросил.
# beat:end

{ visitor_identity == "collector":
# layer:thought
# line:fight_motive_inventory_collector_conflict
# mark:conflict=взыскателя
# mark:conflict=складскую недостачу
Нашивка указывала на взыскателя. Накладная - на складскую недостачу.
# beat:end

# layer:unknown
# line:fight_motive_inventory_collector_unease
# visual:causal_gap
Нилл снова посмотрел на нашивку. Она не стала знакомее.
# beat:end
}

{ visitor_identity == "stranger":
# layer:thought
# line:fight_motive_inventory_stranger_conflict
# mark:conflict=Накладная
# mark:conflict=ни один знак
Накладная могла быть настоящей. Человека со складом пока не связывал ни один знак.
# beat:end

# layer:unknown
# line:fight_motive_inventory_stranger_unease
# visual:causal_gap
Номер партии он узнал раньше, чем сумел связать с ним этого человека.
# beat:end
}

-> motive_pressure

+ [Это была долговая расписка.]
~ visitor_motive = "debt"

# layer:thought
# line:fight_motive_debt_01
Внизу листа стояло его собственное имя.

# layer:thought
# line:fight_motive_debt_02
Подпись была похожа на его. Размытые чернила помогали.
# beat:end

{ visitor_identity == "worker":
# layer:thought
# line:fight_motive_debt_worker_conflict
# mark:conflict=складу
# mark:conflict=частному долгу
Знак мог принадлежать складу. Расписка - частному долгу. Одно не объясняло другого.
# beat:end

# layer:unknown
# line:fight_motive_debt_worker_unease
# visual:causal_gap
Почему складской рабочий принёс расписку с именем Нилла, память не объяснила.
# beat:end
}

{ visitor_identity == "stranger":
# layer:thought
# line:fight_motive_debt_stranger_conflict
# mark:conflict=Расписка
# mark:conflict=у этого человека
Расписка могла быть настоящей. Ничто пока не объясняло, почему она оказалась у этого человека.
# beat:end

# layer:unknown
# line:fight_motive_debt_stranger_unease
# visual:causal_gap
Своё имя Нилл узнал. Человека - нет.
# beat:end
}

-> motive_pressure

+ [Это была салфетка.]
~ visitor_motive = "nothing"

# layer:thought
# line:fight_motive_nothing_01
Обычная белая салфетка, сложенная вчетверо.

# layer:thought
# line:fight_motive_nothing_02
Нилл всё равно искал на ней своё имя.
# beat:end

{ visitor_identity != "stranger":
# layer:thought
# line:fight_motive_nothing_mark_conflict
# mark:conflict=Знак на куртке
# mark:conflict=Салфетка
Знак на куртке мог что-то значить. Салфетка не объясняла, зачем человек пришёл.
# beat:end

# layer:unknown
# line:fight_motive_nothing_mark_unease
# visual:causal_gap
Он продолжал смотреть на чистую салфетку, будто буквы могли проступить позже.
# beat:end
}

-> motive_pressure


=== motive_pressure ===

{
- visitor_motive == "inventory":

# layer:dialogue
# speaker:nill
# line:fight_nill_inventory_reply
\- Возвращать уже нечего.
# beat:end

- visitor_motive == "debt":

# layer:dialogue
# speaker:nill
# line:fight_nill_debt_reply
\- Значит, зря пришёл.
# beat:end

- else:

# layer:dialogue
# speaker:nill
# line:fight_nill_question_reply
\- Тогда спрашивай и уходи.
# beat:end
}


# layer:narration
# line:fight_edward_reaction
Эдвард медленно выдохнул через нос. Продолжение он уже знал.
# beat:end


# layer:dialogue
# speaker:visitor
# line:fight_visitor_reason_01
\- Мне сказали, тебя можно найти здесь.
# beat:end


{
- visitor_motive == "inventory":

# layer:dialogue
# speaker:visitor
# line:fight_visitor_inventory_01
\- Вернёшь то, что забрал, и разойдёмся.
# beat:end

# layer:dialogue
# speaker:visitor
# line:fight_visitor_inventory_02
\- Я не собираюсь второй раз объяснять, чего не хватает.
# beat:end

- visitor_motive == "debt":

# layer:dialogue
# speaker:visitor
# line:fight_visitor_debt_01
\- Ты обещал рассчитаться ещё месяц назад.
# beat:end

# layer:dialogue
# speaker:nill
# line:fight_nill_debt_reply_02
\- Покажи, где я это обещал.
# beat:end

# layer:dialogue
# speaker:visitor
# line:fight_visitor_debt_02
\- В расписке. Разверни и прочитай.
# beat:end

- visitor_motive == "nothing":

# layer:dialogue
# speaker:visitor
# line:fight_visitor_nothing_01
\- Я ведь хотел только спросить...
# beat:end

# layer:dialogue
# speaker:visitor
# line:fight_visitor_nothing_02
\- Но ты уже смотришь так, будто я что-то должен.
# beat:end
}

# layer:unknown
# line:fight_visitor_reason_late_01
Эти слова появились позже.
# beat:end

# layer:thought
# line:fight_visitor_reason_late_02
До этого Нилл помнил только движение губ и собственное раздражение.
# beat:end


# layer:narration
# line:fight_motive_detail_01
Бумагу он так и не развернул до конца.

# layer:thought
# line:fight_motive_detail_02
Нилл не увидел, что было в середине листа.
# beat:end


# layer:narration
# line:fight_sensory_01
От человека пахло мокрой шерстью и машинным маслом.
# beat:end

# layer:narration
# line:fight_sensory_02
Через секунду осталась только мята.

# layer:unknown
# line:fight_sensory_03
# memory:flicker
Посетитель при этом не двигался.
# beat:end


# layer:narration
# line:fight_first_motion_01
# sfx:visitor-step-02
# music:fade 2200
# music:duck 0.035
Посетитель шагнул к столу и поднял руку.
# beat:end


# layer:unknown
# line:fight_first_motion_02
# sfx:impact_early
# visual:impact_blackout
# music:start fight_memory
# music:fade 1800
# music:volume 0.34
Звук удара пришёл первым. Рука посетителя ещё поднималась.
# beat:end


# layer:narration
# line:fight_first_motion_03
Посетитель всё ещё стоял перед ним и не выглядел раненым.
# beat:end


# layer:thought
# line:fight_first_motion_04
Во рту появился металлический привкус.
# beat:end

# layer:thought
# line:fight_first_motion_05
Щёку он ещё не прикусил.
# beat:end

-> fight_first_choice


=== fight_first_choice ===

~ checkpoint_doubt = doubt
~ checkpoint_delusion = delusion
~ checkpoint_fracture = fracture
~ checkpoint_memory_strain = memory_strain
~ checkpoint_strain_reason = strain_reason

# debug-choice:significant
+ [Ударить первым.]
~ selected_first = "self"

# layer:narration
# line:fight_first_self_01
# sfx:stand-up
Нилл резко поднялся.
# beat:end

# layer:narration
# line:fight_first_self_01b
Посетитель ещё не закончил свой шаг.
# beat:end

# layer:narration
# line:fight_first_self_01c
# sfx:chair-scrape
Стул со скрипом отъехал назад.
# beat:end

# layer:narration
# line:fight_first_self_02
Подошва скользнула. Удар вышел ниже, чем Нилл целил.
# beat:end

# layer:narration
# line:fight_first_self_03
# sfx:body-hit-heavy
Кулак пришёлся под рёбра.
# beat:end

# layer:narration
# line:fight_first_self_03b
Посетитель выдохнул и согнулся.
# beat:end

# layer:thought
# line:fight_first_self_04
"Закончить это сразу."
# beat:end

# layer:thought
# line:fight_first_self_05
Он подумал это тогда.
# beat:end

# layer:thought
# line:fight_first_self_06
Или он подумал это позже.
# beat:end

# layer:narration
# line:fight_first_self_07
Запястье отозвалось болью.
# beat:end

# layer:narration
# line:fight_first_self_07b
Посетитель согнулся чуть позже.
# beat:end

-> check_first_memory

+ [Перехватить его руку.]
~ selected_first = "other"

# layer:narration
# line:fight_first_other_01
Посетитель схватил Нилла за воротник.
# beat:end

# layer:narration
# line:fight_first_other_02
Ткань врезалась в шею и на миг сбила дыхание.
# beat:end

# layer:narration
# line:fight_first_other_02b
Вторая рука прошла возле лица.
# beat:end

# layer:narration
# line:fight_first_other_02c
Усики поймали движение воздуха и прижались назад.
# beat:end

# layer:narration
# line:fight_first_other_03
Нилл перехватил запястье и вывернул руку наружу.
# beat:end

# layer:thought
# line:fight_first_other_04
Это уже было проще.
# beat:end

# layer:thought
# line:fight_first_other_05
Когда чужое запястье у тебя в руке, объяснения обычно заканчиваются.
# beat:end

# layer:thought
# line:fight_first_other_06
Из-за вина хватка получилась слабее.
# beat:end

-> check_first_memory

+ [Не двигаться.]
~ selected_first = "unknown"

# layer:narration
# line:fight_first_unknown_01
Нилл остался сидеть.
# beat:end

# layer:narration
# line:fight_first_unknown_02
Посетитель остановился у самого стола.
# beat:end

# layer:narration
# line:fight_first_unknown_03
Несколько секунд никто не двигался дальше.
# beat:end

# layer:unknown
# line:fight_first_unknown_04
Удар всё равно прозвучал где-то рядом.
# sfx:impact_distant
# beat:end

# layer:thought
# line:fight_first_unknown_05
Скулу обдало болью.
# beat:end

# layer:thought
# line:fight_first_unknown_06
Нилл не понял, к какому движению её прицепить.
# beat:end

-> check_first_memory

=== check_first_memory ===

~ first_memory_match = false
~ first_resolution = selected_first

{ fight_answer == "self" && selected_first == "self":
~ first_memory_match = true
}

{ fight_answer == "other" && selected_first == "other":
~ first_memory_match = true
}

{ fight_answer == "unknown":
~ first_memory_match = true
}


{ first_memory_match:

{ fight_answer == "unknown":

# layer:archive
# line:fight_first_match_unknown_01
В прошлый раз Нилл сказал Эдварду, что не помнит.
# beat:end

{ selected_first == "unknown":

# layer:thought
# line:fight_first_match_unknown_02
# memory:anchor_created
И сейчас ни одно движение не назвало виноватого.
# beat:end

- else:

# layer:thought
# line:fight_first_match_unknown_new
# memory:partial_stability
Раньше Нилл не назвал виноватого. Новое движение этому не мешало.
# beat:end
}

- else:

# layer:thought
# line:fight_first_match_01
# memory:match
Эдварду он назвал то же начало.
# beat:end
}

-> identity_check

- else:

# layer:unknown
# line:fight_first_mismatch_01
# sfx:memory-whoosh-short
# visual:motion_repeat
Последнее движение повторилось.
# beat:end


# layer:unknown
# line:fight_first_mismatch_02
Рука. Воротник. Скрип стула.
# beat:end


# layer:thought
# line:fight_first_mismatch_03
Нилл не понимал, что было первым.
# beat:end


# layer:archive
# line:fight_first_mismatch_04
Эдвард уже задавал этот вопрос.
# beat:end


# layer:archive
# line:fight_first_mismatch_05
Кто первым полез?
# beat:end


{
- fight_answer == "self":

# layer:archive
# line:fight_first_previous_self
# memory:contradiction
Тогда Нилл ответил: "Я".
# beat:end

- fight_answer == "other":

# layer:archive
# line:fight_first_previous_other
# memory:contradiction
Тогда Нилл ответил: "Он".
# beat:end
}


# debug-choice:significant
+ [Удержать прежний ответ.]
~ delusion = delusion + 1
~ first_resolution = fight_answer

# layer:thought
# line:fight_resolve_delusion_01
Нилл уже дал ответ. Остальное должно было встать на место.
# beat:end

{
- fight_answer == "self":

{
- selected_first == "other":

# layer:unknown
# line:fight_resolve_delusion_self_from_other
# sfx:memory-whoosh-sharp
# music:resync
# rewrite:Посетитель держал Нилла за воротник. Нилл выворачивал его запястье.=Рука посетителя вернулась к боку. Нилл уже стоял перед ним. Первым ударил он.
Посетитель держал Нилла за воротник. Нилл выворачивал его запястье.
# beat:end

- else:

# layer:unknown
# line:fight_resolve_delusion_self_from_stillness
# sfx:memory-whoosh-sharp
# music:resync
# rewrite:Нилл всё ещё сидел. Посетитель стоял у стола.=Шаг посетителя исчез. Нилл уже стоял перед ним. Первым ударил он.
Нилл всё ещё сидел. Посетитель стоял у стола.
# beat:end
}

- else:

{
- selected_first == "self":

# layer:unknown
# line:fight_resolve_delusion_other_from_self
# sfx:memory-whoosh-sharp
# music:resync
# rewrite:Кулак Нилла пришёлся посетителю под рёбра.=Нилл снова сидел у стола. Рука посетителя уже сомкнулась на его воротнике.
Кулак Нилла пришёлся посетителю под рёбра.
# beat:end

- else:

# layer:unknown
# line:fight_resolve_delusion_other_from_stillness
# sfx:memory-whoosh-sharp
# music:resync
# rewrite:Нилл всё ещё сидел. Посетитель стоял у стола.=Нилл остался у стола. Рука посетителя уже сомкнулась на его воротнике.
Нилл всё ещё сидел. Посетитель стоял у стола.
# beat:end
}
}

-> identity_check

+ [Принять нынешнее начало.]
~ first_resolution = selected_first

# layer:thought
# line:fight_resolve_current_01
Сейчас перед ним было движение. Старый ответ держался только на том, что он уже был сказан.
# beat:end

# layer:archive
# line:fight_resolve_current_02
# memory:partial_stability
В прошлый раз он сказал иначе.
# beat:end

-> identity_check

+ [Сохранить оба начала.]
~ fracture = fracture + 1
~ first_resolution = "split"

# layer:thought
# line:fight_resolve_fracture_01
В одном начале первым двинулся Нилл. В другом - посетитель. Оба начала цеплялись за одну и ту же боль.
# beat:end

# layer:unknown
# line:fight_resolve_fracture_02
# sfx:hollow
# visual:double_position
# music:desync
Ни одна версия не исчезла.
# beat:end

-> identity_check

+ [Он не знал, кто начал.]
~ doubt = doubt + 1
~ first_resolution = "unknown"

# layer:thought
# line:fight_resolve_doubt_01
# music:duck 0.18
Движение осталось. Виноватого в нём не было.
# beat:end

# layer:thought
# line:fight_resolve_doubt_02
# music:restore
Нилл впервые не стал сам назначать виноватого.
# beat:end

-> identity_check
}


=== identity_check ===

~ identity_conflict = false
~ motive_conflict = false

# layer:narration
# line:fight_identity_check_01
# sfx:shoulder-contact
Посетитель ударился плечом о стол. Бумага выпала из руки.
# beat:end


# layer:narration
# line:fight_identity_check_02
Она развернулась на мокром полу.
# beat:end


{
- visitor_identity == "worker" && visitor_motive == "inventory":

# layer:archive
# line:fight_identity_supported_worker
# memory:match
На листе оказалась складская таблица. В углу повторялся знак с куртки.
# beat:end

-> can_memory

- visitor_identity == "collector" && visitor_motive == "debt":

# layer:archive
# line:fight_identity_supported_collector
# memory:match
На листе стояли суммы, даты и подпись, похожая на подпись Нилла. Нашивка хотя бы объясняла, почему документ был у посетителя.
# beat:end

-> can_memory

- visitor_identity == "stranger" && visitor_motive == "nothing":

# layer:archive
# line:fight_identity_supported_stranger
# memory:partial_stability
Белая салфетка прилипла к полу мокрым углом. На ней не было ни букв, ни знака.
# beat:end

# layer:thought
# line:fight_identity_supported_stranger_basis
На этот раз чистая салфетка не требовала объяснений.
# beat:end

-> can_memory

- else:

~ identity_conflict = true
~ motive_conflict = true

# layer:unknown
# line:fight_identity_conflict_01
# memory:contradiction
# mark:conflict=не удержал прежний вид
Развернувшись на полу, лист не удержал прежний вид.
# beat:end

{
- visitor_motive == "inventory":

# layer:unknown
# line:fight_identity_conflict_inventory
Номер партии исчез. Вместо него проступили суммы и даты.
# beat:end

- visitor_motive == "debt":

# layer:unknown
# line:fight_identity_conflict_debt
Подпись расплылась. Лист разбился на строки складской таблицы.
# beat:end

- visitor_motive == "nothing":

# layer:unknown
# line:fight_identity_conflict_nothing
На белой салфетке выступили мелкие цифры.
# beat:end
}

# layer:thought
# line:fight_identity_conflict_basis
Середину листа он тогда не прочитал. Теперь строки менялись без него.
# beat:end

# debug-choice:significant
+ [Удержать выбранную причину.]
~ memory_strain = memory_strain + 1
~ delusion = delusion + 1
~ strain_reason = "motive"

# layer:thought
# line:fight_identity_force_01
Нет.
# beat:end

# layer:thought
# line:fight_identity_force_01b
Нилл не отвёл взгляд. На листе должно было быть то, с чем человек пришёл.
# beat:end

# layer:unknown
# line:fight_identity_force_02
# sfx:memory-whoosh-deep
# music:resync
Строки на листе поплыли и встали иначе.
# beat:end

-> can_memory

+ [Оставить обе бумаги настоящими.]
~ fracture = fracture + 1

# layer:unknown
# line:fight_identity_split_01
# sfx:hollow
# music:desync
Под мокрым листом лежал второй.
# beat:end

# layer:unknown
# line:fight_identity_split_02
На одном была подпись. На другом - номер партии.
# beat:end

-> can_memory

+ [Нилл слишком рано решил, что понял.]
~ doubt = doubt + 1

# layer:thought
# line:fight_identity_doubt_01
# music:duck 0.18
До драки Нилл видел только края листа и несколько мокрых строк.
# beat:end

# layer:thought
# line:fight_identity_doubt_02
# music:restore
Всё остальное могло появиться уже потом.
# beat:end

-> can_memory
}


=== can_memory ===

# layer:narration
# line:fight_can_01
# sfx:can_roll
Банка ударилась о пол и покатилась под стол.
# beat:end


# layer:thought
# line:fight_can_02
# memory:flicker
Или банка всё ещё была у него в руке.
# beat:end


# debug-choice:significant
+ [Сжать банку в руке.]
~ selected_can = "hand"

# layer:narration
# line:fight_can_hand_01
# sfx:can-crush
Банка смялась под пальцами.
# beat:end

# layer:narration
# line:fight_can_hand_02
Остатки вина выплеснулись на рукав.
# beat:end

# layer:thought
# line:fight_can_hand_03
Рука сделалась липкой.
# beat:end

# layer:thought
# line:fight_can_hand_04
Саму банку Нилл чувствовал хуже, чем липкость на руке.
# beat:end

-> check_can_memory

+ [Поднять банку с пола.]
~ selected_can = "floor"

# layer:narration
# line:fight_can_floor_01
Нилл нагнулся, не отрывая взгляда от посетителя.
# beat:end

# layer:narration
# line:fight_can_floor_02
Пальцы нашли банку у ножки стола.
# beat:end

# layer:narration
# line:fight_can_floor_03
Вмятина на боку была тёплой.
# beat:end

-> check_can_memory

+ [Оттолкнуть её ботинком.]
~ selected_can = "kick"

# layer:narration
# line:fight_can_kick_01
Банка укатилась под соседний стол.
# beat:end

# layer:thought
# line:fight_can_kick_02
# sfx:can-toe-contact
Металл стукнул по носку ботинка.
# beat:end

# layer:unknown
# line:fight_can_kick_03
Нога Нилла ещё не двигалась.
# beat:end

-> check_can_memory


=== check_can_memory ===

~ can_memory_match = false

{ caught_can && selected_can == "hand":
~ can_memory_match = true
}

{ not caught_can && selected_can == "floor":
~ can_memory_match = true
}

{ not caught_can && selected_can == "kick":
~ can_memory_match = true
}


{ can_memory_match:

{ caught_can:

# layer:archive
# line:fight_can_match_hand
# memory:match
Банка осталась в его руке.
# beat:end

- else:

# layer:archive
# line:fight_can_match_floor
# memory:match
Банка упала.
# beat:end
}

-> edward_memory

- else:

{ caught_can:

# layer:archive
# line:fight_can_mismatch_caught_01
Нилл помнил холодный металл в ладони.
# beat:end

# layer:archive
# line:fight_can_mismatch_caught_02
# memory:contradiction
Но до пола банка так и не долетела.
# beat:end

- else:

# layer:archive
# line:fight_can_mismatch_dropped_01
Нилл помнил удар банки о пол.
# beat:end

# layer:archive
# line:fight_can_mismatch_dropped_02
# memory:contradiction
# mark:conflict=не должно было
В его руке при этом не должно было ничего оставаться.
# beat:end
}


# debug-choice:significant
+ [Поставить банку на прежнее место.]
~ delusion = delusion + 1

# layer:unknown
# line:fight_can_resolve_delusion
# memory:force_anchor
# music:resync
# rewrite:Банка исчезла из одного места и оказалась в другом.=Банка была там, где ей полагалось быть.
Банка исчезла из одного места и оказалась в другом.
# beat:end

-> edward_memory

+ [Принять нынешнее положение банки.]

# layer:thought
# line:fight_can_resolve_current_01
Холод металла в ладони исчез. Осталась только банка на полу.
# beat:end

# layer:archive
# line:fight_can_resolve_current_02
# memory:partial_stability
Прежнее ощущение больше не возвращалось.
# beat:end

-> edward_memory

+ [Оставить банку в обоих местах.]
~ fracture = fracture + 1

# layer:unknown
# line:fight_can_resolve_fracture_01
Банка лежала на полу.
# beat:end

# layer:unknown
# line:fight_can_resolve_fracture_02
# sfx:hollow
# visual:object_double
# music:desync
# split-word:оставалась в руке=лежала на полу
И оставалась в руке Нилла.
# beat:end

-> edward_memory

+ [Не смотреть на неё.]
~ doubt = doubt + 1

# layer:thought
# line:fight_can_resolve_doubt_01
# music:duck 0.18
Он перестал искать банку взглядом.
# beat:end

# layer:thought
# line:fight_can_resolve_doubt_02
# music:restore
Смотреть нужно было на посетителя.
# beat:end

-> edward_memory
}


=== edward_memory ===

# layer:dialogue
# speaker:visitor
# line:fight_visitor_threat
# mark:uncertain=с кем
\- Ты хоть знаешь, с кем говоришь?
# beat:end

# layer:dialogue
# speaker:visitor
# line:fight_visitor_threat_02
\- Тебе должны были сказать.
# beat:end


# layer:dialogue
# speaker:nill
# line:fight_nill_drinking
\- ...Я понятия не имею, кто ты нахуй такой.
# beat:end


# layer:dialogue
# speaker:edward
# line:fight_edward_warning
\- Нилл.
# beat:end


# layer:narration
# line:fight_edward_voice_01
Голос пришёл со стороны стойки.
# beat:end


# layer:narration
# line:fight_edward_voice_02
# memory:spatial_contradiction
Эдвард стоял у двери.
# beat:end


# layer:narration
# line:fight_edward_voice_03
Нилл посмотрел за стойку.
# beat:end


# layer:narration
# line:fight_edward_voice_04
За стойкой никого не было.
# beat:end


# layer:narration
# line:fight_edward_choice_01
Посетитель рванулся вперёд.
# beat:end


# layer:unknown
# line:fight_edward_choice_02
# visual:edward_split
На мгновение Эдвард оказался в нескольких местах.
# beat:end


# debug-choice:significant
+ [Эдвард вмешался.]
~ selected_edward = "intervened"

# layer:narration
# line:fight_edward_intervened_01
Эдвард встал между ними и толкнул посетителя в грудь.
# beat:end

# layer:narration
# line:fight_edward_intervened_02
# sfx:body_impact
Локоть пришёлся Эдварду в лицо.
# beat:end

# layer:narration
# line:fight_edward_intervened_03
Эдвард отшатнулся и зажал рот ладонью.
# beat:end

# layer:thought
# line:fight_edward_intervened_04
Кровь запуталась в усах. Эдвард потом обвинит именно их.
# beat:end

-> check_edward_memory

+ [Эдвард остался возле двери.]
~ selected_edward = "door"

# layer:narration
# line:fight_edward_door_choice_01
Эдвард не сдвинулся с места.
# beat:end

# layer:thought
# line:fight_edward_door_choice_02
Обычно он вмешивался раньше первого разбитого стакана.
# beat:end

# layer:narration
# line:fight_edward_door_choice_03
Сейчас Эдвард только поднял руку, не отходя от двери.
# beat:end

-> check_edward_memory

+ [Эдварда здесь не было.]
~ selected_edward = "absent"

# layer:narration
# line:fight_edward_absent_01
У двери не оказалось никого.
# beat:end

# layer:thought
# line:fight_edward_absent_02
Нилл не мог вспомнить момент, когда Эдвард исчез.
# beat:end

# layer:unknown
# line:fight_edward_absent_03
Голос продолжал звать Нилла по имени.
# beat:end

-> check_edward_memory


=== check_edward_memory ===

~ edward_conflict = false
~ edward_resolution = selected_edward

{ selected_edward == "door":
~ edward_conflict = false
}

{ selected_edward == "absent":
~ edward_conflict = true
}

{ selected_edward == "intervened":
~ edward_conflict = false
}


{ not edward_conflict:

{
- selected_edward == "intervened":

# layer:archive
# line:fight_edward_match_intervened
# memory:partial_stability
Три шага от двери до стола исчезли. Локоть и кровь в усах Эдварда остались.
# beat:end

- else:

# layer:archive
# line:fight_edward_match_door
# memory:partial_stability
До и после предупреждения Эдвард оставался у двери.
# beat:end

# layer:thought
# line:fight_edward_match_door_basis
Голос мог прийти не с той стороны. Эдвард - нет.
# beat:end
}

-> nill_response

- else:

# layer:archive
# line:fight_edward_conflict_01
# memory:contradiction
# mark:conflict=никого
У двери не оказалось никого. Но Нилл уже видел там Эдварда и слышал его голос.
# beat:end

# layer:thought
# line:fight_edward_conflict_02
Голос остался. Человека, которому он принадлежал, не было.
# beat:end


# debug-choice:significant
+ [Вернуть Эдварда в драку.]
~ delusion = delusion + 1
~ edward_resolution = "intervened"

# layer:unknown
# line:fight_edward_force_01
# music:resync
В дверном проёме снова проступила фигура Эдварда.
# beat:end

# layer:unknown
# line:fight_edward_force_02
# rewrite:В следующую секунду он уже стоял между ними.=Он всё время стоял между ними.
В следующую секунду он уже стоял между ними.
# beat:end

-> nill_response

+ [Оставить Эдварда и в баре, и вне его.]
~ fracture = fracture + 1
~ edward_resolution = "split"

# layer:unknown
# line:fight_edward_split_01
# sfx:hollow
# music:desync
Один Эдвард держал посетителя за плечи.
# beat:end

# layer:unknown
# line:fight_edward_split_02
Другого в баре не было.
# beat:end

-> nill_response

+ [Нилл не следил за Эдвардом.]
~ doubt = doubt + 1
~ edward_resolution = "unknown"

# layer:thought
# line:fight_edward_doubt_01
# music:duck 0.18
Нилл следил за ближайшей рукой.
# beat:end

# layer:thought
# line:fight_edward_doubt_02
# music:restore
Эдварда в этом движении не было.
# beat:end

-> nill_response
}


=== nill_response ===

# layer:narration
# line:fight_response_01
Посетитель пошёл на Нилла всем весом.
# beat:end


# layer:narration
# line:fight_response_02
Нилл заметил проход к двери, бутылку у локтя и мокрый след под чужой подошвой.
# beat:end


{
- edward_resolution == "intervened":

# layer:narration
# line:fight_response_edward_intervened
Эдвард отступал к стойке, прижимая ладонь к губе.
# beat:end

- edward_resolution == "door":

# layer:narration
# line:fight_response_edward_door
Эдвард только теперь оттолкнулся от дверного косяка.
# beat:end

- edward_resolution == "split":

# layer:unknown
# line:fight_response_edward_split
Один Эдвард двигался от двери. Другой уже стоял у стойки.
# beat:end

- else:

# layer:thought
# line:fight_response_edward_unknown
Где был Эдвард, Нилл больше не проверял.
# beat:end
}


# layer:narration
# line:fight_response_04
Нилл отступил на полшага и пропустил его ближе.
# beat:end


# layer:narration
# line:fight_response_05
# sfx:shoe-slip
# visual:pain-slip
Мокрая подошва скользнула по полу.
# beat:end

# layer:narration
# line:fight_response_06
# sfx:knee-contact
# visual:pain-jolt
Колено задело угол стола.
# beat:end

# layer:thought
# line:fight_response_07
# sfx:pain-pulse
# visual:pain-throb
# music:duck 0.22
Колено заныло.
# beat:end

# layer:thought
# line:fight_response_08
# memory:pain_anchor
Этой боли Нилл верил.
# beat:end

# layer:narration
# line:fight_stop_01
# music:restore
Человек уже валился на него.
# beat:end

# layer:thought
# line:fight_stop_02
Не выиграть.
# beat:end

# layer:thought
# line:fight_stop_03
Закончить.
# beat:end

+ [Встретить его бутылкой.]
~ selected_response = "bottle"

# layer:narration
# line:fight_response_bottle_01
Нилл схватил бутылку за горлышко.
# beat:end

# layer:narration
# line:fight_response_bottle_02
# sfx:glass_impact
Первый удар пришёлся по предплечью. Посетитель разжал пальцы.
# beat:end

# layer:narration
# line:fight_response_bottle_03
Стекло отдало в ладонь.
# beat:end

# layer:narration
# line:fight_response_bottle_04
# sfx:strike-swipe
# visual:brief_shake
Второй удар Нилл направил выше.
# beat:end

# layer:thought
# line:fight_response_bottle_05
Попал ли он, Нилл не понял.
# beat:end

-> cigarette_memory

+ [Увести руку и прижать его к столу.]
~ selected_response = "hold"

# layer:narration
# line:fight_response_hold_01
Нилл шагнул в сторону и пропустил посетителя мимо.
# beat:end

# layer:narration
# line:fight_response_hold_02
Он вывернул руку и прижал посетителя щекой к мокрому столу.
# beat:end

# layer:narration
# line:fight_response_hold_03
# sfx:body_impact
Под ладонью что-то хрустнуло. Скорее всего, лёд.
# beat:end

# layer:narration
# line:fight_response_hold_04
Посетитель дёрнулся. Нилл сильнее прижал руку.
# beat:end

# layer:dialogue
# speaker:nill
# line:fight_response_hold_line
\- Хватит.
# beat:end

# layer:thought
# line:fight_response_hold_05
Голос Нилла прозвучал спокойно.
# beat:end

-> cigarette_memory

+ [Отойти с линии движения.]
~ selected_response = "evade"

# layer:narration
# line:fight_response_evade_01
Нилл отступил в последний момент.
# beat:end

# layer:narration
# line:fight_response_evade_02
# sfx:glass-knee-fall
Посетитель зацепил стол, смахнул стакан и упал на колено.
# beat:end

# layer:narration
# line:fight_response_evade_03
Кто-то в зале коротко рассмеялся.
# beat:end

# layer:unknown
# line:fight_response_evade_04
Кажется, это был Нилл.
# beat:end

# layer:narration
# line:fight_response_evade_05
Посетитель поднялся ещё злее.
# beat:end

-> cigarette_memory


=== cigarette_memory ===

# layer:narration
# line:fight_cigarette_01
Нилл заметил сигарету.
# beat:end


{
- cigarette_state == "untouched":

# layer:narration
# line:fight_cigarette_untouched_01
Пепел всё-таки упал в чашу.
# beat:end

# layer:archive
# line:fight_cigarette_untouched_02
# memory:match
Сигарета стала короче. Между разговором и дракой для этого хватало времени.
# beat:end

-> cigarette_after_choice

- cigarette_state == "smoked":

# layer:narration
# line:fight_cigarette_smoked_01
Она давно должна была закончиться.
# beat:end

# layer:unknown
# line:fight_cigarette_smoked_02
# memory:contradiction
Между пальцами снова тлела целая сигарета.
# beat:end

- cigarette_state == "ashed":

# layer:narration
# line:fight_cigarette_ashed_01
Старый пепел лежал на дне чаши.
# beat:end

# layer:archive
# line:fight_cigarette_ashed_02
# memory:match
На кончике собирался новый пепел. Старый оставался в чаше.
# beat:end


-> cigarette_after_choice
}


# debug-choice:significant
+ [Вернуть сигарету в то состояние, которое Нилл помнил.]
~ delusion = delusion + 1

# layer:thought
# line:fight_cigarette_force_01
Нилл знал, какой она должна была остаться.
# beat:end

# layer:unknown
# line:fight_cigarette_force_02
# music:resync
# memory:force_anchor
# rewrite:Окурок укоротился. Пепел вернулся в чашу.=Окурок всегда был коротким. Пепел лежал в чаше.
Окурок укоротился. Пепел вернулся в чашу.
# beat:end

-> cigarette_after_choice

+ [Оставить оба состояния.]
~ fracture = fracture + 1

# layer:unknown
# line:fight_cigarette_split_01
# music:desync
Сигарета лежала в пепельнице.
# beat:end

# layer:unknown
# line:fight_cigarette_split_02
# visual:object_double
# mark:conflict=одновременно
И одновременно тлела между пальцами.
# beat:end

-> cigarette_after_choice

+ [Не пытаться определить её состояние.]
~ doubt = doubt + 1

# layer:thought
# line:fight_cigarette_doubt_01
# music:duck 0.18
Сигарета не стоила того, чтобы придумывать ей прошлое.
# beat:end

# layer:thought
# line:fight_cigarette_doubt_02
Нилл отвернулся от пепельницы.
# beat:end

# layer:thought
# line:fight_cigarette_doubt_03
# music:restore
За спиной она могла оставаться чем угодно.
# beat:end

-> cigarette_after_choice


=== cigarette_after_choice ===

{ smoked_edward:

# layer:narration
# line:fight_edward_cough_01
Эдвард закашлялся тем же коротким кашлем, которым раньше ответил на дым.
# beat:end

# layer:unknown
# line:fight_edward_cough_02
Кашель раздался за спиной Нилла.
# beat:end
}


# layer:archive
# line:fight_clock_01
# visual:clock_focus
# music:duck 0.12
# music:filter narrow
Часы над стойкой показывали 02:43.
# beat:end


{
- selected_response == "bottle":

# layer:narration
# line:fight_repeat_bottle_01
Посетитель выпрямился, прижимая ушибленную руку к груди.
# beat:end

# layer:unknown
# line:fight_repeat_bottle_02
# sfx:memory-whoosh-short
# visual:motion_repeat
# music:restore
Через секунду та же рука снова тянулась к Ниллу, будто удара бутылкой не было.
# beat:end

- selected_response == "hold":

# layer:narration
# line:fight_repeat_hold_01
Хватка Нилла ослабла. Посетитель оторвал щёку от стола.
# beat:end

# layer:unknown
# line:fight_repeat_hold_02
# sfx:memory-whoosh-short
# visual:motion_repeat
# music:restore
Вывернутое плечо снова пошло вперёд тем же движением.
# beat:end

- else:

# layer:narration
# line:fight_repeat_01
# sfx:stand-up
Посетитель поднялся с пола.
# beat:end

# layer:unknown
# line:fight_repeat_02
# sfx:memory-whoosh-short
# visual:motion_repeat
# music:restore
Он поднялся ещё раз, повторив движение до последнего рывка плеча.
# beat:end
}


# layer:dialogue
# speaker:nill
# line:fight_nill_no
\- Нет.
# beat:end


# layer:thought
# line:fight_nill_no_thought
Нилл не знал, кому это сказал.
# beat:end

-> fight_stance_choice


=== fight_stance_choice ===

# debug-choice:significant
+ [Всё уже произошло.]
~ delusion = delusion + 1

# layer:thought
# line:fight_stance_delusion_01
# music:resync
Нилл знал следующий удар раньше, чем увидел плечо.
# beat:end

# layer:narration
# line:fight_stance_delusion_02
Он уклонился до того, как рука дошла до него.
# beat:end

# layer:narration
# line:fight_stance_delusion_03
# sfx:body-fall-heavy
Посетитель упал на знакомое место.
# beat:end

# layer:narration
# line:fight_stance_delusion_04
# sfx:glass_fall
Бутылка разбилась почти вовремя.
# beat:end

# layer:unknown
# line:fight_stance_delusion_05
# memory:perfect_sequence
Нилл ещё не услышал Эдварда, но уже знал, где тот сделает паузу.
# beat:end

-> check_fight_outcome

+ [Это происходит сейчас.]
~ doubt = doubt + 1

# layer:thought
# line:fight_stance_doubt_01
# music:duck 0.18
Нилл дождался движения плеча.
# beat:end

# layer:narration
# line:fight_stance_doubt_02
Край стола упирался ему в спину.
# beat:end

# layer:thought
# line:fight_stance_doubt_03
Эдварда он больше не искал.
# beat:end

# layer:thought
# line:fight_stance_doubt_04
# memory:partial_stability
Нилл не позволил себе смотреть дальше ближайшей руки.
# beat:end

# layer:narration
# line:fight_stance_doubt_05
Рука посетителя прошла вдоль щеки. Нилл шагнул наружу и толкнул его в плечо.
# beat:end

# layer:narration
# line:fight_stance_doubt_06
# sfx:body-fall-heavy
# music:restore
Посетитель налетел на стул и опрокинул его вместе с собой.
# beat:end

-> check_fight_outcome

+ [Обе версии произошли.]
~ fracture = fracture + 1

# layer:unknown
# line:fight_stance_fracture_01
# sfx:memory-whoosh-deep
# music:desync
Звук первого удара уже стих.
# beat:end

# layer:unknown
# line:fight_stance_fracture_02
# sfx:hollow
# mark:conflict=одновременно
Рука, которая должна была его нанести, одновременно только поднималась.
# beat:end

# layer:unknown
# line:fight_stance_fracture_03
# sfx:body-fall
У стола Нилл ещё стоял. У двери то же тело уже лежало на мокром полу.
# beat:end

# layer:unknown
# line:fight_stance_fracture_04
Эдвард держал Нилла за плечо.
# beat:end

# layer:unknown
# line:fight_stance_fracture_05
# visual:hard_double_exposure
Его голос одновременно доносился от двери.
# beat:end

# layer:unknown
# line:fight_stance_fracture_06
# memory:partial_stability
Только опрокинутый стул оставался на одном месте. В обеих версиях посетитель падал рядом с ним.
# beat:end

-> check_fight_outcome


=== check_fight_outcome ===

{ fracture >= 3:
-> probability_collapse
}

{ delusion >= 3:
-> perfect_version
}

{ memory_strain >= 2:
-> unsupported_version
}

-> fight_end


=== fight_end ===

# layer:thought
# line:fight_end_stability_01
Между движением руки и падением стула ничего не осталось.
# beat:end

# layer:narration
# line:fight_end_stability_02
# memory:partial_stability
Нилл помнил только начало и то, где посетитель оказался после.
# beat:end

# layer:narration
# line:fight_end_01
# visual:fight_aftermath_flash
# sfx:fight-end-flash
# music:fade 650
# music:stop
Драка закончилась быстро.
# beat:end

# layer:thought
# line:fight_end_02
# sfx:aftermath-drop
В памяти она длилась гораздо дольше.
# beat:end


# layer:narration
# line:fight_end_03
Посетитель лежал у опрокинутого стула.
# beat:end


# layer:narration
# line:fight_end_04
# music:start fight_aftermath
# music:fade 6500
# music:volume 0.17
Куртка задралась на плече.
# beat:end


{
- visitor_identity == "worker":

# layer:unknown
# line:fight_end_identity_worker
Знак грузовой компании теперь выглядел обычным пятном.
# beat:end

- visitor_identity == "collector":

# layer:unknown
# line:fight_end_identity_collector
Знак службы взыскания оказался заплатой.
# beat:end

- visitor_identity == "stranger":

# layer:unknown
# line:fight_end_identity_stranger
На пустой ткани проступил контур эмблемы.
# beat:end
}


{
- edward_resolution == "intervened":

# layer:narration
# line:fight_end_05
Эдвард прижимал салфетку к разбитой губе.
# beat:end

# layer:unknown
# line:fight_end_06
# sfx:memory-realign
Нилл моргнул. Кровь осталась на губе, но салфетка снова была чистой.
# beat:end

- edward_resolution == "door":

# layer:narration
# line:fight_end_edward_door_arrival
Эдвард дошёл от двери до опрокинутого стула, когда всё уже закончилось.
# beat:end

# layer:thought
# line:fight_end_edward_door_basis
На этот раз три шага не исчезли.
# beat:end

- edward_resolution == "split":

# layer:unknown
# line:fight_end_edward_split_settle
# sfx:memory-realign
# memory:partial_stability
У опрокинутого стула два Эдварда совпали. В руке у одного осталась чистая салфетка.
# beat:end

- else:

# layer:narration
# line:fight_end_edward_unknown_arrival
Эдвард стоял возле посетителя с чистой салфеткой в руке.
# beat:end

# layer:thought
# line:fight_end_edward_unknown_basis
Как Эдвард подошёл, Нилл не видел. Пустоту между ними он оставил пустой.
# beat:end
}


# layer:narration
# line:fight_end_body_01
На языке был привкус крови.
# beat:end


# layer:thought
# line:fight_end_body_02
Он провёл языком по внутренней стороне щеки.
# beat:end

# layer:thought
# line:fight_end_body_03
Слева щипало.
# beat:end

# layer:thought
# line:fight_end_body_04
Крови он не нашёл.
# beat:end


# layer:dialogue
# speaker:edward
# line:fight_end_edward_well
\- Ну?
# beat:end


# layer:dialogue
# speaker:nill
# line:fight_end_nill_what
\- Что?
# beat:end


# layer:dialogue
# speaker:edward
# line:fight_end_edward_question
\- Кто первым полез?
# beat:end


# layer:narration
# line:fight_end_hands_01
Нилл посмотрел на руки.
# beat:end


# layer:narration
# line:fight_end_hands_02
На одной была кровь, на другой - липкое вино.
# beat:end


# layer:narration
# line:fight_end_hands_03
Банки не было ни в одной.
# beat:end

-> final_answer_choice


=== final_answer_choice ===

# debug-choice:significant
+ [Я.]
~ final_fight_answer = "self"

{ first_resolution != "self":
~ strain_reason = "answer"
{ fight_answer == "self":
~ memory_strain = memory_strain + 1
- else:
~ memory_strain = memory_strain + 2
}
}
-> final_answer_spoken

+ [Он.]
~ final_fight_answer = "other"

{ first_resolution != "other":
~ strain_reason = "answer"
{ fight_answer == "other":
~ memory_strain = memory_strain + 1
- else:
~ memory_strain = memory_strain + 2
}
}
-> final_answer_spoken

+ [Не помню.]
~ final_fight_answer = "unknown"
~ doubt = doubt + 1
-> final_answer_spoken

+ [Ты уже спрашивал.]
~ final_fight_answer = "repeated"
~ doubt = doubt + 1

-> final_answer_spoken


=== final_answer_spoken ===

# layer:narration
# line:fight_final_pause
Нилл ответил не сразу.
# beat:end

# layer:narration
# line:fight_final_pause_02
Вопрос был простой. Слишком простой для того, что осталось у него в голове.
# beat:end

{
- final_fight_answer == "self":

# layer:dialogue
# speaker:nill
# line:fight_final_self_line
\- Я.
# beat:end

# layer:thought
# line:fight_final_self_after
Слово сразу стало тяжёлым и удобным.
# beat:end

- final_fight_answer == "other":

# layer:dialogue
# speaker:nill
# line:fight_final_other_line
\- Он.
# beat:end

# layer:thought
# line:fight_final_other_after
Чужая вина всегда держалась в памяти крепче своей.
# beat:end

- final_fight_answer == "unknown":

# layer:dialogue
# speaker:nill
# line:fight_final_unknown_line
# music:duck 0.18
\- Не помню.
# beat:end

# layer:thought
# line:fight_final_unknown_after
От этого ответ не стал легче.
# beat:end

- final_fight_answer == "repeated":

# layer:dialogue
# speaker:nill
# line:fight_final_repeated_line
# music:duck 0.18
\- Ты уже спрашивал.
# beat:end

# layer:narration
# line:fight_final_repeated_edward
Эдвард посмотрел на него чуть дольше обычного.
# beat:end

-> final_consistency_check
}


{
- final_fight_answer == "unknown":

{ fight_answer == "unknown":

# layer:archive
# line:fight_final_response_unknown_match
# memory:match
И тогда, и сейчас Нилл оставил вопрос без виноватого.
# beat:end

- else:

# layer:archive
# line:fight_final_response_now_unknown
# memory:partial_stability
В прошлый раз Нилл назвал виноватого. Сейчас ни одно движение не убедило его повторить ответ.
# beat:end
}

- final_fight_answer == first_resolution:

{ final_fight_answer == fight_answer:

# layer:thought
# line:fight_final_response_match
# memory:match
На этот раз ответ не пришлось поправлять.
# beat:end

- else:

# layer:archive
# line:fight_final_response_current_basis
# memory:partial_stability
В прошлый раз Нилл сказал иначе. Сейчас перед словами осталось движение.
# beat:end
}

- first_resolution == "split":

# layer:archive
# line:fight_final_response_split_basis
# memory:partial_stability
Нилл выбрал одно из двух начал. Второе от этого не исчезло.
# beat:end

- final_fight_answer == fight_answer:

# layer:archive
# line:fight_final_response_old_basis
# memory:contradiction
Нилл повторил старый ответ. Только что увиденное движение к нему не вело.
# beat:end

- else:

# layer:archive
# line:fight_final_response_changed
# visual:causal_gap
Слова прозвучали раньше, чем Нилл нашёл для них движение.
# beat:end
}

-> final_consistency_check

=== final_consistency_check ===

{ fracture >= 3:
-> probability_collapse
}

{ delusion >= 3:
-> perfect_version
}

{ memory_strain >= 2:
-> unsupported_version
}

-> chapter_02_end


=== chapter_02_end ===

# layer:archive
# line:fight_end_clock
# music:duck 0.12
Часы показывали 02:43.
# beat:end


# layer:narration
# line:fight_end_final
# music:cut
Нилл запомнил драку именно так.
# beat:end

# layer:unknown
# line:fight_end_final_02
Когда это стало воспоминанием, он не понял.
# beat:end


// Здесь приложение должно:
// completed_chapter_2 = true
// сохранить doubt, delusion, fracture, memory_strain и final_fight_answer
// сохранить visitor_identity и visitor_motive
// обновить краткий пересказ и синие пометки в меню

-> END

=== unsupported_version ===

# layer:archive
# line:fight_unsupported_01
Эдвард дослушал до конца.
# beat:end


# layer:dialogue
# speaker:edward
# line:fight_unsupported_02
\- Хорошо.
# beat:end


{
- strain_reason == "answer":

# layer:dialogue
# speaker:edward
# line:fight_unsupported_answer_01
\- Ты это видел?
# beat:end

# layer:dialogue
# speaker:edward
# line:fight_unsupported_answer_02
\- Или просто решил ещё раз?
# beat:end

- else:

{
- visitor_motive == "debt":

# layer:dialogue
# speaker:edward
# line:fight_unsupported_debt_01
# rewrite:Он пришёл за долгом.=Он пришёл за чем-то.
\- Он пришёл за долгом.
# beat:end

# layer:dialogue
# speaker:edward
# line:fight_unsupported_debt_02
\- Каким долгом?
# beat:end

- visitor_motive == "inventory":

# layer:dialogue
# speaker:edward
# line:fight_unsupported_inventory_01
# rewrite:Он пришёл за украденным.=Он пришёл за чем-то.
\- Он пришёл за украденным.
# beat:end

# layer:dialogue
# speaker:edward
# line:fight_unsupported_inventory_02
\- Что именно ты украл?
# beat:end

- visitor_motive == "nothing":

# layer:dialogue
# speaker:edward
# line:fight_unsupported_nothing_01
# rewrite:Он ничего от тебя не хотел.=Он чего-то от тебя хотел.
\- Он ничего от тебя не хотел.
# beat:end

# layer:dialogue
# speaker:edward
# line:fight_unsupported_nothing_02
\- Тогда почему началась драка?
# beat:end
}
}


# layer:narration
# line:fight_unsupported_03
Нилл открыл рот, чтобы ответить.
# beat:end


# layer:unknown
# line:fight_unsupported_04
Ответ пришёл раньше воспоминания.
# beat:end

# layer:unknown
# line:fight_unsupported_05
Нилл поискал движение, которое могло к нему привести.
# beat:end

{
- strain_reason == "answer":

# layer:narration
# line:fight_unsupported_basis_answer
За ответом не оказалось ни поднятой первым руки, ни шага навстречу.
# beat:end

- visitor_motive == "debt":

# layer:narration
# line:fight_unsupported_basis_debt
На листе не осталось ни прочитанной суммы, ни уверенно узнанной подписи.
# beat:end

- visitor_motive == "inventory":

# layer:narration
# line:fight_unsupported_basis_inventory
Нилл не мог назвать ни одной прочитанной строки и ни одной вещи, которую требовали вернуть.
# beat:end

- else:

# layer:narration
# line:fight_unsupported_basis_nothing
Он не помнил ни вопроса посетителя, ни развёрнутой салфетки.
# beat:end
}


# layer:thought
# line:fight_unsupported_07
Нилл знал ответ. Воспоминание не знало, откуда его взять.
# beat:end

# layer:thought
# line:fight_unsupported_08
Это было хуже лжи.
# beat:end


# layer:archive
# line:fight_unsupported_title
# visual:causal_gap
ОТВЕТ ПОЯВИЛСЯ РАНЬШЕ ПРИЧИНЫ.
# beat:end


# debug-choice:significant
+ [Нет. Сначала.]
-> restore_fight_checkpoint


=== probability_collapse ===

# layer:thought
# line:fight_collapse_cause_01
Каждый раз, когда две детали не помещались рядом, Нилл оставлял обе.
# beat:end

# layer:unknown
# line:fight_collapse_cause_02
Теперь память перестала понимать, какое движение принадлежало какому телу.
# beat:end

# layer:unknown
# line:fight_collapse_01
# sfx:impact_early
# music:desync
Нилл ударил первым.
# beat:end


# layer:unknown
# line:fight_collapse_02
# sfx:impact_distant
# music:desync
Его ударили первым.
# beat:end


# layer:unknown
# line:fight_collapse_03
# music:desync
Эдвард успел вмешаться.
# beat:end


# layer:unknown
# line:fight_collapse_04
У двери не стоял никто.
# beat:end


# layer:unknown
# line:fight_collapse_05
Посетитель пришёл за долгом.
# beat:end


# layer:unknown
# line:fight_collapse_06
Посетитель никогда прежде не слышал имени Нилла.
# beat:end


# layer:unknown
# line:fight_collapse_07
# visual:all_versions
Банка лежала под столом и всё ещё летела через зал.
# beat:end


# layer:narration
# line:fight_collapse_08
По отдельности Нилл узнавал каждое из них.
# beat:end


# layer:narration
# line:fight_collapse_09
# music:volume 0.42
Стоило удержать два сразу - стол, дверь и люди переставали помещаться в одном баре.
# beat:end


# layer:thought
# line:fight_collapse_10
Нилл выбрал одно движение и попытался удержать только его.
# beat:end


# layer:narration
# line:fight_collapse_11
Бар потянулся за ней. Дверь ушла влево, стойка - в другую сторону.
# beat:end


# layer:narration
# line:fight_collapse_12
# visual:temple_pain_flash
Боль прошла от виска к левому запястью и сомкнулась там холодным кольцом.
# beat:end


# layer:unknown
# line:fight_collapse_13
Движения больше не соединялись в драку. Каждое требовало для себя отдельного тела и отдельного места.
# beat:end


# layer:thought
# line:fight_collapse_14
Ещё одна попытка - и Нилл перестанет понимать, чья боль отзывается у него во рту и запястье.
# beat:end


# layer:archive
# line:fight_collapse_title
# visual:hard_double_exposure
НИЛЛ БОЛЬШЕ НЕ ПОНИМАЛ, КАКУЮ ДРАКУ ВСПОМИНАЕТ.
# beat:end


# debug-choice:significant
+ [Нет. Сначала.]
-> restore_fight_checkpoint


=== perfect_version ===

# layer:thought
# line:fight_perfect_cause_01
Нилл приготовился снова разобрать драку по движениям - от первого шага до бутылки.
# beat:end

# layer:narration
# line:fight_perfect_cause_02
Но напряжение за глазами отпустило. На секунду стало почти хорошо.
# beat:end

# layer:unknown
# line:fight_perfect_cause_03
# fx:probability-pull
Бар поплыл по краям. Стойка вытянулась к двери, а столы медленно разошлись, оставляя между собой один прямой проход.
# beat:end

# layer:narration
# line:fight_perfect_cause_04
Нилл положил ладони на стол, чтобы удержаться.
# beat:end

# layer:narration
# line:fight_perfect_cause_04b
Пальцы уже двигались сами: подтолкнули банку, расправили край мокрого листа.
# beat:end

# layer:thought
# line:fight_perfect_cause_05
Он не приказывал им двигаться.
# beat:end

# layer:unknown
# line:fight_perfect_cause_06
Каждое движение делало следующее неизбежным. Комната охотно уступала.
# beat:end

# layer:narration
# line:fight_perfect_bs_01
Ровный гул прорезался сквозь музыку.
# beat:end


# layer:unknown
# line:fight_perfect_bs_02
Синий свет лёг поперёк стола. Не от часов.
# beat:end


# layer:unknown
# line:fight_perfect_bs_03
# visual:bluespace_correction
Пустые места начали заполняться сами.
# beat:end


# layer:unknown
# speaker:unknown_voice
# line:fight_perfect_bs_04
# memory:flicker
- Ты всегда так делаешь.
# beat:end

# layer:thought
# line:fight_perfect_bs_04b
Фраза была знакомой.
# beat:end

# layer:thought
# line:fight_perfect_bs_04c
Голос - нет.
# beat:end


# layer:unknown
# line:fight_perfect_bs_05
Сначала стали исчезать мелкие несоответствия.
# beat:end

# layer:thought
# line:fight_perfect_bs_05a
Лишний шаг.

# layer:thought
# line:fight_perfect_bs_05b
Голова, повёрнутая не в ту сторону.

# layer:thought
# line:fight_perfect_bs_05c
Пауза перед ударом.
# beat:end


# layer:unknown
# line:fight_perfect_bs_06
Потом исчезли версии, в которых эти мелочи ещё могли остаться.

# beat:end


# layer:thought
# line:fight_perfect_choice_01
Где был Эдвард?

# beat:end


# choice-rewrite:Эдвард оказался между ними.
# debug-choice:significant
+ [Эдвард остался у двери.]
-> perfect_reality_corrected

+ [Эдвард подошёл после удара.]
-> perfect_reality_corrected

+ [Эдварда рядом не было.]
-> perfect_reality_corrected


=== perfect_reality_corrected ===

~ selected_edward = "intervened"


# layer:narration
# line:fight_perfect_01
# music:resync
# music:volume 0.38
Посетитель сделал шаг. Колени Нилла разогнулись сами; тело уже знало, куда перенести вес.
# beat:end


# layer:narration
# line:fight_perfect_02
Эдвард оказался между ними.

# layer:narration
# line:fight_perfect_02b
Нилл не помнил, когда именно.
# beat:end


# layer:thought
# line:fight_perfect_choice_02
Где была банка?

# beat:end


# choice-rewrite:Банка была в руке Нилла.
# debug-choice:significant
+ [Банка осталась под столом.]
-> perfect_can_corrected

+ [Банка откатилась к двери.]
-> perfect_can_corrected

+ [Нилл потерял её из виду.]
-> perfect_can_corrected


=== perfect_can_corrected ===

~ selected_can = "hand"


# layer:narration
# line:fight_perfect_03
Нилл протянул руку. Банка уже была в ней.
# beat:end


# layer:thought
# line:fight_perfect_choice_03
Зачем пришёл посетитель?

# beat:end


# choice-rewrite:Он пришёл за долгом.
# debug-choice:significant
+ [Из-за недостачи.]
-> perfect_cause_corrected

+ [Он не успел объяснить.]
-> perfect_cause_corrected

+ [Он ошибся адресом.]
-> perfect_cause_corrected


=== perfect_cause_corrected ===

~ visitor_motive = "debt"
~ visitor_identity = "collector"


# layer:narration
# line:fight_perfect_04
На бумаге проступили сумма и подпись.
# beat:end


# layer:narration
# line:fight_perfect_05
# visual:unnatural_stillness
Пятно на куртке сомкнулось в знак службы взыскания.
# beat:end


# layer:unknown
# line:fight_perfect_06
Стол перестал двоиться по краям. Дверь вернулась на место.
# beat:end

# layer:unknown
# line:fight_perfect_06b
Лицо посетителя больше не пыталось стать чужим.
# beat:end


# layer:thought
# line:fight_perfect_07
Нилл не смог вспомнить последнюю деталь, которая спорила.

# beat:end


# layer:narration
# line:fight_perfect_08
Он не разобрал ни одной строки на бумаге. Всё равно знал, что там написано.
# beat:end


# layer:thought
# line:fight_perfect_10
Облегчение оказалось тёплым и постыдным. Нилл позволил ему остаться.
# beat:end


# layer:thought
# line:fight_perfect_11
Он попробовал усомниться хотя бы в одной детали.
# beat:end

# layer:thought
# line:fight_perfect_11b
Сомнение не нашло, за что зацепиться.

# beat:end


# layer:thought
# line:fight_perfect_12
Нилл хотел найти момент, где всё пошло неправильно.

# beat:end


# layer:thought
# line:fight_perfect_13
Но этот момент уже был исправлен.

# beat:end


# layer:unknown
# line:fight_perfect_title
# visual:bluespace_correction
Другого порядка событий Нилл больше не помнил.
# beat:end


# debug-choice:significant
+ [Нет. Сначала.]
-> restore_fight_checkpoint
