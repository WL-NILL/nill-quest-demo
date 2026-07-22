VAR cigarette_state = "untouched"
VAR caught_can = true
VAR boasted_catch = false
VAR job_answer = "downsized"
VAR theft_answer = "unknown"
VAR smoked_edward = false
VAR fight_answer = "unset"


=== opening_bar ===
# scene:bar_0243
# palette:bar-warm
# background:bar-soft
# music:start


# layer:narration
# line:bar_opening_01
Бар занимал подвал. Неоновые лампы висели низко над столами, а в узких окнах под потолком мелькали ноги прохожих и полосы уличного света.

# beat:end


# layer:narration
# line:bar_opening_01b
С улицы вниз вела узкая лестница. Над ней висела выцветшая вывеска.

# beat:end


# layer:narration
# line:bar_opening_02
На левом запястье тускло синели цифры.

# layer:thought
# line:bar_opening_03
02:43.

# beat:end


# layer:narration
# line:bar_opening_04
Время от времени открывалась дверь. Холод проходил по полу и гас у первых столов.

# layer:narration
# line:bar_opening_05
Дальше оставались дым, дешёвое вино и старая обивка.

# beat:end


# layer:narration
# line:bar_opening_06
Нилл сидел, откинувшись в кожаном кресле.

# beat:end


# layer:narration
# line:bar_opening_05b
Стол под локтем качнулся. Нилл сложил салфетку вдвое и подсунул под короткую ножку.

# beat:end


# layer:narration
# line:bar_opening_07
Левая рука осталась на столе. Между пальцами тлела недокуренная сигарета.

# beat:end


# layer:narration
# line:bar_opening_08
Пепел вытянулся почти на ширину пальца и всё ещё держался.

# beat:end


# debug-choice:significant
* [Затянуться.]
~ cigarette_state = "smoked"
-> opening_cigarette_smoked

* [Стряхнуть пепел.]
~ cigarette_state = "ashed"
-> opening_cigarette_ashed

* [Оставить как есть.]
~ cigarette_state = "untouched"
-> opening_cigarette_untouched


=== opening_cigarette_smoked ===

# layer:narration
# line:bar_cigarette_smoked_01
# sfx:smoke-inhale
Нилл затянулся.

# beat:end


# layer:narration
# line:bar_cigarette_smoked_02
# sfx:smoke-exhale
Огонёк прошёл по бумаге, оставив свежий тёмный ободок. Сигарета стала заметно короче, а рыхлый пепел осыпался на стол сам.

# beat:end


# layer:narration
# line:bar_cigarette_smoked_03
Ногтем большого пальца Нилл сдвинул осыпавшуюся серую крошку к краю металлической чаши.

# beat:end

-> bar_edward_arrives


=== opening_cigarette_ashed ===

# layer:narration
# line:bar_cigarette_ashed_01
Нилл стряхнул пепел в металлическую чашу.

# beat:end


# layer:narration
# line:bar_cigarette_ashed_02
Серый комок рассыпался среди старых окурков. На конце сигареты осталась ровная тлеющая кромка.

# beat:end

-> bar_edward_arrives


=== opening_cigarette_untouched ===

# layer:narration
# line:bar_cigarette_untouched_01
Нилл не стал ничего делать.

# beat:end


# layer:narration
# line:bar_cigarette_untouched_02
Пепел продолжил расти, удерживаясь на сигарете вопреки собственному весу.

# beat:end


# layer:narration
# line:bar_cigarette_untouched_03
Нилл отметил, где он упадёт, если всё-таки сорвётся.


# beat:end


# layer:thought
# line:bar_cigarette_untouched_04
Между чашей и старым пятном от вина.

# beat:end

-> bar_edward_arrives


=== bar_edward_arrives ===

# layer:dialogue
# speaker:edward
# line:bar_edward_01
\- Тебе не кажется, что сегодня ты задерживаешься?

# beat:end


# layer:narration
# line:bar_edward_desc_01
Голос выдернул Нилла из мыслей.

# beat:end


# layer:narration
# line:bar_edward_desc_02
Эдвард стоял напротив, опустив ладони на стол.

# beat:end


# layer:narration
# line:bar_edward_desc_03
# pause:2000
Молодой человек с округлым лицом, короткими каштановыми волосами и блеклыми глазами. Бледная кожа резко выделялась на фоне тёмного помещения.

# layer:thought
# line:bar_edward_desc_04
И эти нелепые усы.

# beat:end


# layer:narration
# line:bar_edward_desc_05
Верхняя пуговица рубашки была застёгнута не в ту петлю. Эдвард так ходил с начала смены и, конечно, считал это неважным.

# beat:end


# layer:narration
# line:bar_nill_reaction_01
# pause:1000
Нилл нахмурился.

# layer:narration
# line:bar_nill_reaction_02
Сейчас физиономия Эдварда почему-то не забавляла. Скорее раздражала.

# beat:end


* [- Не кажется.]
-> staying_answer_original

* [- Тебе-то что?]
-> staying_answer_irritated

* [- Мне утром никуда.]
-> staying_answer_job


=== staying_answer_original ===

# layer:dialogue
# speaker:nill
# line:bar_nill_01a
\- Не кажется.

# beat:end

-> bar_work_comment


=== staying_answer_irritated ===

# layer:dialogue
# speaker:nill
# line:bar_nill_01b
\- Тебе-то что?

# beat:end


# layer:dialogue
# speaker:edward
# line:bar_edward_irritated_01
\- Я здесь работаю. К сожалению, ты тоже здесь.

# beat:end

-> bar_work_comment


=== staying_answer_job ===

# layer:dialogue
# speaker:nill
# line:bar_nill_01c
\- Мне утром никуда.

# beat:end


# layer:narration
# line:bar_edward_job_reaction_01
Эдвард приподнял бровь.

# beat:end

-> bar_work_comment


=== bar_work_comment ===

# layer:dialogue
# speaker:edward
# line:bar_edward_02
\- На работу, я так понимаю, ты уже идти не планируешь.

# beat:end


# layer:narration
# line:bar_edward_action_01
Эдвард навис над столом чуть сильнее.

# beat:end


* [- Не зуди, Эдвард. Лучше принеси вина.]
-> wine_request_original

* [Молча подвинуть к Эдварду пустую банку.]
-> wine_request_short

* [- Ты официант или социальный работник?]
-> wine_request_social


=== wine_request_original ===

# layer:dialogue
# speaker:nill
# line:bar_nill_02a
\- Не зуди, Эдвард. Лучше принеси вина.

# beat:end

-> wine_refusal


=== wine_request_short ===

# layer:narration
# line:bar_nill_02b
# sfx:can_roll
Нилл молча подвинул пустую банку к краю стола - поближе к Эдварду.

# beat:end

-> wine_refusal


=== wine_request_social ===

# layer:dialogue
# speaker:nill
# line:bar_nill_02c
\- Ты официант или социальный работник?

# beat:end


# layer:dialogue
# speaker:edward
# line:bar_edward_social_01
\- Официант. Социальным работникам хотя бы платят за разговоры с тобой.

# beat:end


# layer:dialogue
# speaker:nill
# line:bar_nill_social_01
\- Тогда принеси вина.

# beat:end

-> wine_refusal


=== wine_refusal ===

# layer:dialogue
# speaker:edward
# line:bar_edward_03
\- Сам встань и возьми.

# beat:end


# layer:narration
# line:bar_nill_action_01
Нилл повёл антеннами.

# beat:end


# layer:narration
# line:bar_nill_action_02
Он молча закинул голову на спинку кресла.

# beat:end


{ cigarette_state == "smoked":

# layer:narration
# line:bar_cigarette_followup_smoked
Сигарета стала короче на добрый палец. На конце уже собирался новый, пока ещё плотный слой пепла.
}

{ cigarette_state == "ashed":

# layer:narration
# line:bar_cigarette_followup_ashed
В металлической чаше лежал свежий серый комок. Кончик сигареты продолжал ровно тлеть между пальцами.
}

{ cigarette_state != "smoked" and cigarette_state != "ashed":

# layer:narration
# line:bar_cigarette_followup_untouched
Пепел всё ещё держался. Теперь он слегка изгибался вниз и грозил в любой момент упасть на стол.
}

# beat:end


# layer:dialogue
# speaker:edward
# line:bar_edward_04
\- Уволился?

# beat:end


# layer:narration
# line:bar_nill_reaction_03
# pause:2000
Нилл потёр лоб.

# layer:narration
# line:bar_nill_reaction_04
Слово ему не понравилось.

# beat:end


* [- Сократили.]
~ job_answer = "downsized"
-> job_downsized

* [- Уволили.]
~ job_answer = "fired"
-> job_fired

* [- Давай без этого.]
~ job_answer = "deflected"
-> job_deflected


=== job_downsized ===

# layer:dialogue
# speaker:nill
# line:bar_nill_03a
\- Сократили.

# beat:end

-> loader_joke


=== job_fired ===

# layer:dialogue
# speaker:nill
# line:bar_nill_03b
\- Уволили.

# beat:end


# layer:narration
# line:bar_job_fired_reaction
Эдвард несколько секунд ждал продолжения.

# beat:end


# layer:dialogue
# speaker:nill
# line:bar_job_fired_reply
\- Не смотри так.

# beat:end

-> loader_joke


=== job_deflected ===

# layer:dialogue
# speaker:nill
# line:bar_nill_03c
\- Давай без этого.

# beat:end


# layer:dialogue
# speaker:edward
# line:bar_job_deflected_reply
\- Значит, уволили.

# beat:end

-> loader_joke


=== loader_joke ===

# layer:dialogue
# speaker:edward
# line:bar_edward_05
\- Справедливости ради, грузчик из тебя был бы дерьмовый.

# beat:end


* [- Как из тебя официант.]
-> loader_reply_original

* [- Зато руки у меня не из задницы.]
~ boasted_catch = true
-> loader_reply_boast

* [Молча посмотреть на него.]
-> loader_reply_silent


=== loader_reply_original ===

# layer:dialogue
# speaker:nill
# line:bar_nill_04a
\- Как из тебя официант.

# beat:end

-> edward_grins


=== loader_reply_boast ===

# layer:dialogue
# speaker:nill
# line:bar_nill_04b
\- Зато руки у меня не из задницы.

# beat:end


# layer:dialogue
# speaker:edward
# line:bar_edward_boast_01
\- Сейчас проверим.

# beat:end

-> edward_grins


=== loader_reply_silent ===

# layer:narration
# line:bar_loader_silent_01
Нилл медленно повернул к нему голову.

# beat:end


# layer:narration
# line:bar_loader_silent_02
Эдвард выдержал взгляд.

# beat:end


# layer:dialogue
# speaker:edward
# line:bar_loader_silent_03
\- Убедил.

# beat:end

-> edward_gets_wine


=== edward_grins ===

# layer:narration
# line:bar_edward_reaction_01
Эдвард оскалился, светясь от улыбки.

# beat:end


# layer:dialogue
# speaker:edward
# line:bar_edward_06
\- Лучше быть дерьмовым официантом, чем безупречным безработным.

# beat:end

-> edward_gets_wine


=== edward_gets_wine ===

# layer:narration
# line:bar_edward_action_02
# sfx:stand-up
# pause:2000
Он оттолкнулся от стола и ушёл к стойке.

# layer:narration
# line:bar_edward_action_03
Вернулся почти сразу - уже с банкой вина.

# beat:end


# layer:narration
# line:bar_can_throw
# sfx:strike-swipe
Эдвард бросил банку через стол.

# beat:end


# debug-choice:significant
* [Поймать.]
~ caught_can = true
-> caught_wine_can

* [Упустить.]
~ caught_can = false
-> dropped_wine_can


=== caught_wine_can ===

# layer:narration
# line:bar_can_caught_01
# pause:2000
Нилл поймал банку одной рукой.

# beat:end


# layer:narration
# line:bar_can_caught_02
Холодный металл лёг точно в ладонь.

# beat:end


# layer:narration
# line:bar_can_caught_03
Рука сработала раньше, чем Нилл успел решить, будет ли ловить.

# beat:end


{ boasted_catch:

# layer:dialogue
# speaker:edward
# line:bar_can_caught_boast
\- Надо же. Не соврал.

# beat:end
}

-> wine_debt_request


=== dropped_wine_can ===

# layer:narration
# line:bar_can_dropped_01
# sfx:can_roll
# pause:2000
Банка глухо ударилась о край стола.

# beat:end


# layer:narration
# line:bar_can_dropped_02
Она отскочила, покатилась по полу и остановилась возле ножки соседнего кресла.

# beat:end


# layer:narration
# line:bar_can_dropped_03
Нилл медленно посмотрел на Эдварда.

# beat:end


# layer:narration
# line:bar_can_dropped_04
Банка лежала не там, где должна была. Эта мелочь почему-то раздражала сильнее шутки.

# beat:end


{ boasted_catch:

# layer:dialogue
# speaker:edward
# line:bar_can_dropped_boast
\- Руки не из задницы, говоришь?
}

{ not boasted_catch:

# layer:dialogue
# speaker:edward
# line:bar_can_dropped_loader
\- Грузчик.
}

# beat:end


* [- Закрой рот.]
-> dropped_can_rude

* [- Ты криво бросил.]
-> dropped_can_blame

* [Молча поднять банку.]
-> dropped_can_silent


=== dropped_can_rude ===

# layer:dialogue
# speaker:nill
# line:bar_dropped_can_rude
\- Закрой рот.

# beat:end

-> pick_up_can


=== dropped_can_blame ===

# layer:dialogue
# speaker:nill
# line:bar_dropped_can_blame
\- Ты криво бросил.

# beat:end


# layer:dialogue
# speaker:edward
# line:bar_dropped_can_blame_reply
\- А пол, значит, поймал правильно.

# beat:end

-> pick_up_can


=== dropped_can_silent ===

# layer:narration
# line:bar_dropped_can_silent
Нилл решил не давать ему большего.

# beat:end

-> pick_up_can


=== pick_up_can ===

# layer:narration
# line:bar_can_pickup_01
Он нагнулся и поднял банку.

# beat:end


# layer:narration
# line:bar_can_pickup_02
На боку осталась небольшая вмятина. К холодному металлу прилипли два светлых волоска и пыль с пола.

# beat:end


# layer:narration
# line:bar_can_pickup_03
Нилл стёр всё большим пальцем.

# beat:end


# layer:narration
# line:bar_can_pickup_04
Потом ещё раз провёл по вмятине, хотя выпрямить её уже вряд ли получится.
# beat:end

-> wine_debt_request


=== wine_debt_request ===

# layer:dialogue
# speaker:nill
# line:bar_nill_05
\- Запиши на мой счёт.

# beat:end


{ caught_can:

# layer:narration
# line:bar_can_open_caught
Нилл вскрыл банку. Вино тихо зашипело у отверстия.
}

{ not caught_can:

# layer:narration
# line:bar_can_open_dropped
Нилл потянул за кольцо. Вино сердито зашипело и выплеснулось на пальцы - падение не прошло бесследно.
}

# beat:end


{ caught_can:

# layer:narration
# line:bar_wine_drink_caught
Он отпил и выдохнул чуть свободнее.
}

{ not caught_can:

# layer:narration
# line:bar_wine_drink_dropped
Нилл слизнул каплю с пальца, вытер ладонь о брюки и только потом отпил.
}

# beat:end


# layer:dialogue
# speaker:edward
# line:bar_edward_07
\- Тебе, я смотрю, на экологию тоже совсем насрать.

# beat:end


* [- Это ещё почему?]
-> ecology_why

* [- Только сегодня заметил?]
-> ecology_agree

* [Посмотреть на банку.]
-> ecology_silent


=== ecology_why ===

# layer:dialogue
# speaker:nill
# line:bar_nill_06a
\- Это ещё почему?

# beat:end

-> ecology_punchline


=== ecology_agree ===

# layer:dialogue
# speaker:nill
# line:bar_nill_06b
\- Только сегодня заметил?

# beat:end


# layer:dialogue
# speaker:edward
# line:bar_ecology_agree_reply
\- Я надеялся, что это временное.

# beat:end

-> ecology_punchline


=== ecology_silent ===

# layer:narration
# line:bar_ecology_silent_01
Нилл посмотрел на банку.

# beat:end


# layer:narration
# line:bar_ecology_silent_02
Потом на Эдварда.

# beat:end


# layer:dialogue
# speaker:edward
# line:bar_ecology_silent_reply
\- Не банка. Хотя и банка тоже.

# beat:end

-> ecology_punchline


=== ecology_punchline ===

# layer:dialogue
# speaker:edward
# line:bar_edward_08
\- Бумаги не хватает твои задолженности записывать.

# beat:end


# layer:dialogue
# speaker:edward
# line:bar_edward_09
\- Боюсь представить, сколько лесов вырубили ради одного тебя.

# beat:end


* [- Козёл.]
-> ecology_reply_original

* [- Пиши на обратной стороне.]
-> ecology_reply_backside

* [Улыбнуться.]
-> ecology_reply_smile


=== ecology_reply_original ===

# layer:narration
# line:bar_nill_reaction_05
Нилл еле заметно улыбнулся.

# beat:end


# layer:dialogue
# speaker:nill
# line:bar_nill_07
\- Козёл.

# beat:end

-> firing_reason


=== ecology_reply_backside ===

# layer:dialogue
# speaker:nill
# line:bar_nill_ecology_backside
\- Пиши на обратной стороне.

# beat:end


# layer:narration
# line:bar_edward_ecology_backside_reaction
Эдвард сделал вид, что серьёзно обдумывает предложение.

# beat:end


# layer:dialogue
# speaker:edward
# line:bar_edward_ecology_backside
\- Уже.

# beat:end

-> firing_reason


=== ecology_reply_smile ===

# layer:narration
# line:bar_nill_ecology_smile
Уголок рта Нилла дрогнул.

# beat:end


# layer:dialogue
# speaker:edward
# line:bar_edward_ecology_smile
\- Вот. Даже благодарность получил.

# beat:end

-> firing_reason


=== firing_reason ===

# layer:narration
# line:bar_edward_sits
# sfx:chair-scrape
Эдвард отодвинул соседнее кресло и сел напротив.

# beat:end


# layer:dialogue
# speaker:edward
# line:bar_firing_reason_question
\- И что на этот раз?

# beat:end


# layer:narration
# line:bar_firing_reason_look
Эдвард посмотрел на Нилла, потом на пепельницу.

# beat:end


* [- Кража.]
~ theft_answer = "honest"
-> theft_honest

* [- Почти кража.]
~ theft_answer = "almost"
-> theft_almost

* [- Разногласия по поводу инвентаря.]
~ theft_answer = "euphemism"
-> theft_euphemism


=== theft_honest ===

# layer:dialogue
# speaker:nill
# line:bar_theft_honest_01
\- Кража.

# beat:end


# layer:narration
# line:bar_theft_honest_02
Нилл сделал ещё один глоток.

# beat:end


# layer:dialogue
# speaker:nill
# line:bar_theft_honest_03
\- Самое главное - у меня почти получилось уйти незаметно.

# beat:end

-> high_society


=== theft_almost ===

# layer:dialogue
# speaker:nill
# line:bar_theft_almost_01
\- Почти кража.

# beat:end


# layer:dialogue
# speaker:edward
# line:bar_theft_almost_02
\- Это как?

# beat:end


# layer:dialogue
# speaker:nill
# line:bar_theft_almost_03
\- Украсть получилось. Уйти - почти.

# beat:end

-> high_society


=== theft_euphemism ===

# layer:dialogue
# speaker:nill
# line:bar_theft_euphemism_01
\- Разногласия по поводу инвентаря.

# beat:end


# layer:dialogue
# speaker:edward
# line:bar_theft_euphemism_02
\- Ты его украл.

# beat:end


# layer:dialogue
# speaker:nill
# line:bar_theft_euphemism_03
\- Я им воспользовался.

# beat:end


# layer:dialogue
# speaker:edward
# line:bar_theft_euphemism_04
\- У себя дома.

# beat:end


# layer:dialogue
# speaker:nill
# line:bar_theft_euphemism_05
\- Там было удобнее.

# beat:end

-> high_society


=== high_society ===

# layer:narration
# line:bar_high_society_reaction
Эдвард покачал головой.

# beat:end


# layer:dialogue
# speaker:edward
# line:bar_high_society_01
\- "Высокое общество", - говорил он.

# beat:end


* [- Было бы оно высоким, специалистам бы не приходилось красть инвентарь.]
-> specialist_original

* [- Специалисту нужны инструменты.]
-> specialist_tools

* [- Оно всё равно лежало без дела.]
-> specialist_unused


=== specialist_original ===

# layer:dialogue
# speaker:nill
# line:bar_specialist_original
\- Было бы оно высоким, специалистам бы не приходилось прибегать к краже инвентаря.

# beat:end

-> resume_talk


=== specialist_tools ===

# layer:dialogue
# speaker:nill
# line:bar_specialist_tools_01
\- Специалисту нужны инструменты.

# beat:end


# layer:dialogue
# speaker:edward
# line:bar_specialist_tools_02
\- Грузчику?

# beat:end


# layer:dialogue
# speaker:nill
# line:bar_specialist_tools_03
\- Не начинай.

# beat:end

-> resume_talk


=== specialist_unused ===

# layer:dialogue
# speaker:nill
# line:bar_specialist_unused_01
\- Оно всё равно лежало без дела.

# beat:end


# layer:dialogue
# speaker:edward
# line:bar_specialist_unused_02
\- На складе.

# beat:end


# layer:dialogue
# speaker:nill
# line:bar_specialist_unused_03
\- Именно.

# beat:end


-> resume_talk


=== resume_talk ===

# layer:narration
# line:bar_resume_smoke
# sfx:smoke-inhale
Нилл затянулся сигаретой.

# beat:end


{ cigarette_state == "smoked":

# layer:narration
# line:bar_resume_cigarette_smoked
# sfx:smoke-exhale
От неё оставалось уже меньше половины. Дым обжёг пустой желудок сильнее вина.
}

{ cigarette_state == "ashed":

# layer:narration
# line:bar_resume_cigarette_ashed
# sfx:smoke-exhale
На ровной кромке успел вырасти новый слой пепла.
}

{ cigarette_state != "smoked" and cigarette_state != "ashed":

# layer:narration
# line:bar_resume_cigarette_untouched
# sfx:smoke-exhale
Переросший пепел наконец надломился и упал рядом с металлической чашей.
}

# beat:end


# layer:dialogue
# speaker:nill
# line:bar_resume_01
\- Хорошо хоть вчёрную работал. В резюме не останется.

# beat:end


# layer:narration
# line:bar_resume_01b
Нилл пожал плечами и потянулся за сигаретой.

# beat:end


# layer:dialogue
# speaker:edward
# line:bar_resume_02
\- Ты им вообще пользуешься?

# beat:end


* [- Конечно. Отличная подставка под чай.]
-> resume_tea

* [- Время от времени.]
-> resume_sometimes

* [- У меня есть резюме?]
-> resume_missing


=== resume_tea ===

# layer:dialogue
# speaker:nill
# line:bar_resume_tea_01
\- Конечно. Отличная подставка под чай.

# beat:end


# layer:dialogue
# speaker:edward
# line:bar_resume_tea_02
\- Комиком тоже не пробуй становиться. До собеседования откажут.

# beat:end

-> why_bothering


=== resume_sometimes ===

# layer:dialogue
# speaker:nill
# line:bar_resume_sometimes_01
\- Время от времени.

# beat:end


# layer:dialogue
# speaker:edward
# line:bar_resume_sometimes_02
\- Когда нужно соврать новому работодателю?

# beat:end

-> why_bothering


=== resume_missing ===

# layer:dialogue
# speaker:nill
# line:bar_resume_missing_01
\- У меня есть резюме?

# beat:end


# layer:dialogue
# speaker:edward
# line:bar_resume_missing_02
\- Надеюсь, нет. Я бы не хотел знать, кто тебе его написал.

# beat:end

-> why_bothering


=== why_bothering ===

# layer:narration
# line:bar_why_bothering_01
Нилл уставился в потолок и потёр лоб.

# beat:end


# layer:dialogue
# speaker:nill
# line:bar_why_bothering_02
\- Почему ты ко мне пристал?


# beat:end


# layer:narration
# line:bar_shuttle_01
# sfx:shuttle
Земля едва вздрогнула.

# layer:narration
# line:bar_shuttle_02
По улице над окнами пролетел шаттл.

# beat:end


# layer:narration
# line:bar_shuttle_03
Нилл машинально проследил вибрацию по стакану.

# beat:end


# layer:dialogue
# speaker:edward
# line:bar_why_bothering_03
\- В эту ночную смену из собеседников остался только ты.

# beat:end


# layer:dialogue
# speaker:edward
# line:bar_why_bothering_04
\- К тем пьющим я боюсь лезть. Не хотелось бы встревать и получить по лицу.

# beat:end


* [- Доброта у меня тоже не безграничная.]
-> kindness_original

* [- А я, значит, безопасный?]
-> kindness_safe

* [- Здравый выбор.]
-> kindness_agree


=== kindness_original ===

# layer:dialogue
# speaker:nill
# line:bar_kindness_original_01
\- Доброта у меня тоже не безграничная, Эд.

# beat:end


# layer:dialogue
# speaker:nill
# line:bar_kindness_original_02
\- Закончится ведь.

# beat:end

-> cruiser_dream


=== kindness_safe ===

# layer:dialogue
# speaker:nill
# line:bar_kindness_safe_01
\- А я, значит, безопасный?

# beat:end


# layer:dialogue
# speaker:edward
# line:bar_kindness_safe_02
\- Нет. Ты просто должен мне денег.

# beat:end


# layer:dialogue
# speaker:nill
# line:bar_kindness_safe_03
\- Когда-нибудь отдам.

# beat:end

-> cruiser_dream


=== kindness_agree ===

# layer:dialogue
# speaker:nill
# line:bar_kindness_agree_01
\- Здравый выбор.

# beat:end


# layer:dialogue
# speaker:edward
# line:bar_kindness_agree_02
\- Вот и я так решил.

# beat:end


# layer:dialogue
# speaker:nill
# line:bar_kindness_agree_03
\- Посмотрим, надолго ли тебя хватит.

# beat:end

-> cruiser_dream


=== cruiser_dream ===

# layer:dialogue
# speaker:edward
# line:bar_cruiser_01
\- К тому времени я буду уже далеко отсюда.

# beat:end


# layer:narration
# line:bar_cruiser_02
Он провёл рукой по воздуху.

# beat:end


# layer:dialogue
# speaker:edward
# line:bar_cruiser_03
\- На своём собственном крейсере. В окружении прекрасных дам, богатств и веществ.

# beat:end


# layer:narration
# line:bar_cruiser_04
Глаза его сияли.

# beat:end


* [- Мхм. С нетерпением жду.]
-> cruiser_original

* [- Дамы первыми тебя высадят.]
-> cruiser_ladies

* [- Крейсер тоже в долг возьмёшь?]
-> cruiser_debt


=== cruiser_original ===

# layer:dialogue
# speaker:nill
# line:bar_cruiser_original
\- Мхм. С нетерпением жду.

# beat:end

-> bar_story


=== cruiser_ladies ===

# layer:dialogue
# speaker:nill
# line:bar_cruiser_ladies_01
\- Дамы первыми тебя высадят.

# beat:end


# layer:dialogue
# speaker:edward
# line:bar_cruiser_ladies_02
\- Зависть тебя не красит.

# beat:end

-> bar_story


=== cruiser_debt ===

# layer:dialogue
# speaker:nill
# line:bar_cruiser_debt_01
\- Крейсер тоже в долг возьмёшь?

# beat:end


# layer:dialogue
# speaker:edward
# line:bar_cruiser_debt_02
\- Нет. Обменяю на твой счёт.

# beat:end

-> bar_story


=== bar_story ===

# layer:narration
# line:bar_wine_taste
Вкус вина уже становился пресным - слишком много его было выпито на пустой желудок этой ночью.

# beat:end


{ cigarette_state == "smoked":

# layer:narration
# line:bar_ash_later_smoked
На укоротившейся сигарете снова собрался пепел. Нилл стряхнул его в металлическую чашу.
}

{ cigarette_state == "ashed":

# layer:narration
# line:bar_ash_later_ashed
Новый пепел лёг тонкой серой кромкой. Нилл стряхнул его в металлическую чашу.
}

{ cigarette_state != "smoked" and cigarette_state != "ashed":

# layer:narration
# line:bar_ash_later_untouched
Нилл собрал со стола упавший пепел кончиком пальца и смахнул его в металлическую чашу.
}

# beat:end


# layer:dialogue
# speaker:nill
# line:bar_story_question
\- Что сегодня расскажешь?

# beat:end


# layer:dialogue
# speaker:edward
# line:bar_story_vomit_01
\- Заблевали порог.

# beat:end


# layer:dialogue
# speaker:edward
# line:bar_story_vomit_02
\- Бедолага почти достиг своей цели, но ступеньки оказались ему не по зубам.

# beat:end


# layer:dialogue
# speaker:edward
# line:bar_story_vomit_03
\- Пришлось быстро работать, чтобы новые посетители не подскользнулись на этом дерьме и не улетели головой вниз.

# beat:end


* [- Боишься жалобной книги?]
-> vomit_complaint

* [- Надеюсь, ты взял плату за уборку.]
-> vomit_payment

* [- Романтично.]
-> vomit_romantic


=== vomit_complaint ===

# layer:dialogue
# speaker:nill
# line:bar_vomit_complaint
\- Ммм... А ты так прямо боишься, что они распишутся в жалобной книге?

# beat:end

# layer:dialogue
# speaker:edward
# line:bar_vomit_complaint_02
\- Не жалоб. Не хочу, чтобы кто-нибудь свернул шею у меня на пороге.

# beat:end

-> sirens_talk


=== vomit_payment ===

# layer:dialogue
# speaker:nill
# line:bar_vomit_payment_01
\- Надеюсь, ты взял с него плату за уборку.

# beat:end


# layer:dialogue
# speaker:edward
# line:bar_vomit_payment_02
\- Он уже заплатил. Моими нервами.

# beat:end

# layer:dialogue
# speaker:edward
# line:bar_vomit_payment_03
\- Но убрать всё равно пришлось сразу. Следующий клиент мог свернуть себе шею.

# beat:end

-> sirens_talk


=== vomit_romantic ===

# layer:dialogue
# speaker:nill
# line:bar_vomit_romantic_01
\- Романтично.

# beat:end


# layer:dialogue
# speaker:edward
# line:bar_vomit_romantic_02
\- Ты бы так не говорил, если бы видел цвет.

# beat:end

# layer:dialogue
# speaker:edward
# line:bar_vomit_romantic_03
\- Следующий клиент мог поскользнуться и пересчитать ступеньки затылком. Сплошная романтика.

# beat:end

-> sirens_talk


=== sirens_talk ===

# layer:dialogue
# speaker:edward
# line:bar_sirens_01
\- И попробуй потом дождись "Сирен". Сам же знаешь, сюда они едва-едва добираются.

# beat:end


# layer:dialogue
# speaker:edward
# line:bar_sirens_02
\- После той поножовщины я на них не рассчитываю.

# beat:end


# layer:dialogue
# speaker:edward
# line:bar_sirens_03
\- Помнишь?

# beat:end


# layer:dialogue
# speaker:nill
# line:bar_sirens_04
\- Я её уже и во сне вижу. Ты слишком часто о ней вспоминаешь.


# beat:end


# layer:narration
# line:bar_sirens_05
Эдвард кивнул.

# beat:end


# layer:dialogue
# speaker:edward
# line:bar_smell_01
\- В общем, пахла эта дрянь...

# beat:end


# layer:narration
# line:bar_smell_02
Он демонстративно втянул воздух.

# beat:end


# debug-choice:significant
* [Выдохнуть дым ему в лицо.]
~ smoked_edward = true
-> smoke_edward

* [Дать ему закончить.]
~ smoked_edward = false
-> let_edward_finish

* [- Мне уже не нравится эта история.]
~ smoked_edward = false
-> interrupt_smell


=== smoke_edward ===

# layer:narration
# line:bar_smoke_edward_01
# sfx:smoke-inhale
Нилл поднёс сигарету к губам и глубоко затянулся.

# beat:end


# layer:narration
# line:bar_smoke_edward_02
# sfx:smoke-exhale
Потом резко выдохнул Эдварду в лицо плотный клуб дыма.

# beat:end


# layer:narration
# line:bar_smoke_edward_03
Тот закашлялся и отвернулся. На глазах выступили слёзы.

# beat:end


# layer:narration
# line:bar_smoke_edward_04
Нилл неприлично громко расхохотался.

# beat:end


# layer:narration
# line:bar_smoke_edward_05
Но быстро притих.

# beat:end


# layer:dialogue
# speaker:edward
# line:bar_smoke_edward_06
\- Мудак.

# beat:end


# layer:dialogue
# speaker:nill
# line:bar_smoke_edward_07
\- Всё, всё. Ну и как же оно пахло?

# beat:end

-> smell_punchline


=== let_edward_finish ===

# layer:narration
# line:bar_let_edward_finish
Нилл оставил сигарету у губ, но затягиваться не стал.

# beat:end

-> smell_punchline


=== interrupt_smell ===

# layer:dialogue
# speaker:nill
# line:bar_interrupt_smell_01
\- Мне уже не нравится эта история.

# beat:end


# layer:dialogue
# speaker:edward
# line:bar_interrupt_smell_02
\- Поздно.

# beat:end

-> smell_punchline


=== smell_punchline ===

# layer:dialogue
# speaker:edward
# line:bar_smell_punchline_01
\- Да примерно как у тебя изо рта.

# beat:end


# layer:dialogue
# speaker:edward
# line:bar_smell_punchline_02
\- Только раз в десять хуже.

# beat:end


* [- Ммм...]
-> rich_visitors

* [Проверить дыхание.]
-> check_breath

* [- Значит, терпимо.]
-> smell_tolerable


=== check_breath ===

# layer:narration
# line:bar_check_breath_01
Нилл прикрыл рот ладонью и коротко выдохнул.

# beat:end


# layer:thought
# line:bar_check_breath_02
Ничего необычного.

# beat:end

-> rich_visitors


=== smell_tolerable ===

# layer:dialogue
# speaker:nill
# line:bar_smell_tolerable_01
\- Значит, терпимо.

# beat:end


# layer:dialogue
# speaker:edward
# line:bar_smell_tolerable_02
\- Вот поэтому ты и один.

# beat:end

-> rich_visitors


=== rich_visitors ===

# layer:narration
# line:bar_rich_visitors_01
Эдвард перевёл дыхание.

# beat:end


# layer:dialogue
# speaker:edward
# line:bar_rich_visitors_02
\- Что ещё могу вспомнить...

# beat:end


# layer:narration
# line:bar_rich_visitors_03
Он задумался.

# beat:end


# layer:dialogue
# speaker:edward
# line:bar_rich_visitors_04
\- А. Тут недавно залетала какая-то неприлично богатая компания.

# beat:end


* [- Государники?]
-> visitors_state

* [- Корпораты?]
-> visitors_corporate

* [- И что им здесь понадобилось?]
-> visitors_why


=== visitors_state ===

# layer:dialogue
# speaker:nill
# line:bar_visitors_state_01
\- Государники, думаешь?

# beat:end


# layer:dialogue
# speaker:edward
# line:bar_visitors_state_02
\- Мм... Нет, вряд ли. Скорее туристы.

# beat:end

-> visitors_important


=== visitors_corporate ===

# layer:dialogue
# speaker:nill
# line:bar_visitors_corporate_01
\- Корпораты?

# beat:end


# layer:dialogue
# speaker:edward
# line:bar_visitors_corporate_02
\- Для корпоратов слишком любопытные. Те обычно делают вид, что нас не существует.

# beat:end

-> visitors_important


=== visitors_why ===

# layer:dialogue
# speaker:nill
# line:bar_visitors_why_01
\- И что им здесь понадобилось?

# beat:end


# layer:dialogue
# speaker:edward
# line:bar_visitors_why_02
\- Вот и мне интересно.

# beat:end

-> visitors_important


=== visitors_important ===

# layer:dialogue
# speaker:edward
# line:bar_visitors_important_01
\- Слишком уж важные.

# beat:end


# layer:dialogue
# speaker:nill
# line:bar_visitors_important_02
\- И?

# beat:end


# layer:narration
# line:bar_visitors_important_03
Нилл повёл рукой.

# layer:narration
# line:bar_visitors_important_03b
Эдвард на секунду сжал губы.

# beat:end


# layer:dialogue
# speaker:edward
# line:bar_visitors_important_04
\- Похоже, они что-то вынюхивают.

# beat:end


# layer:dialogue
# speaker:edward
# line:bar_visitors_important_05
\- Как бы этот район ни решили застроить подчистую.

# beat:end


# layer:narration
# line:bar_visitors_important_06
Нилл промолчал. Район был плохим местом.


# layer:thought
# line:bar_visitors_important_07
Но он знал, как он устроен.

# beat:end


-> city_memory


=== city_memory ===


# fx:memory-drift
# background:city-archive

# layer:narration
# line:bar_city_transition_01
Нилл перевёл взгляд на подвальные окна.

# beat:end

# layer:narration
# line:bar_city_transition_02
В тёмном стекле ещё держался бар.

# beat:end


# layer:narration
# line:bar_city_transition_02b
Свет с улицы проступал сквозь отражение.

# beat:end


# layer:narration
# line:bar_city_01
За подвальными окнами прошли чьи-то ноги.

# beat:end


# layer:narration
# line:bar_city_02
Стоптанные рабочие ботинки. Женские туфли с отклеившейся подошвой. Детские сапоги, мигающие при каждом шаге.

# beat:end

# layer:narration
# line:bar_city_03
Следом по бетону коротко царапнули когти.

# beat:end


# layer:archive
# line:bar_city_archive_01
Преимущественно человеческое население.

# layer:archive
# line:bar_city_archive_01b
Крупнейшие меньшинства - нианы, унатхи и арахниды.

# beat:end


# layer:narration
# line:bar_city_04
Так район выглядел в отчётах.

# beat:end


# layer:thought
# line:bar_city_05
Будто людей здесь можно было пересчитать и закончить предложение точкой.

# beat:end


# layer:narration
# line:bar_city_06
На улице пахло влажным бетоном, машинным маслом и пережаренным мясом из круглосуточного ларька.

# beat:end

# layer:narration
# line:bar_city_07
Человеческие голоса занимали почти всё свободное место.

# beat:end


# layer:unknown
# speaker:woman
# line:bar_city_voice_01
- После смены зайдёшь за ним. Я второй раз не пойду.

# beat:end


# layer:unknown
# speaker:man
# line:bar_city_voice_02
- Я сказал, что зайду.

# beat:end


# layer:narration
# line:bar_city_08
Они спорили этажом выше.

# beat:end


# layer:narration
# line:bar_city_09
У женщины в руке был красный пакет. На костяшке мужчины белел пластырь.

# beat:end


# layer:thought
# line:bar_city_10
Нилл помнил это.

# beat:end


# layer:narration
# line:bar_city_11
Он никогда их не видел.

# beat:end


# layer:narration
# line:bar_city_11b
Не мог видеть. Между ним и улицей были потолок и мутное стекло.

# beat:end


# layer:thought
# line:bar_city_11c
Но деталь была на месте.

# beat:end


# layer:narration
# line:bar_city_12
Ниан в районе становилось больше с каждым годом.

# beat:end

# layer:narration
# line:bar_city_13
# pause:2000
Их привозили новые смены, дешёвые общежития и работа, на которую местные уже не соглашались.


-> city_migration


=== city_migration ===

# fx:memory-drift
# background:city-archive


# layer:archive
# line:bar_city_archive_02
Основной причиной роста нечеловеческого населения стала трудовая миграция.

# beat:end


# layer:narration
# line:bar_city_14
Фраза была знакомой.

# beat:end


# layer:narration
# line:bar_city_15
Нилл не помнил, где её прочитал.

# beat:end


# layer:narration
# line:bar_city_15b
Источник потерялся.

# beat:end


# layer:thought
# line:bar_city_16
В учебнике. В статье. На обороте какого-нибудь буклета.

# beat:end


# layer:narration
# line:bar_city_17
В памяти она звучала голосом Эдварда.

# beat:end


# layer:unknown
# speaker:edward
# line:bar_city_voice_03
- Трудовая миграция.

# beat:end


# layer:unknown
# speaker:edward
# line:bar_city_voice_04
- ...приезжаешь на три месяца, через десять лет всё ещё не распаковал одну из сумок.

# beat:end


# layer:narration
# line:bar_city_18
Сумка была синей.

# beat:end


# layer:narration
# line:bar_city_19
Она лежала на шкафу в комнате, которой здесь не было.

# beat:end


# layer:narration
# line:bar_city_origin_01
Город принадлежал одному из малых государств Конфедерации Орионских Государств.
# beat:end


# layer:thought
# line:bar_city_origin_02
Когда-то Нилл знал его официальное название.
# beat:end


# layer:thought
# line:bar_city_origin_03
Название самого города - тоже.
# beat:end


# layer:archive
# line:bar_city_origin_04
ДЫРА
# beat:end


# layer:thought
# line:bar_city_origin_05
Так было проще.
# beat:end


# layer:narration
# line:bar_city_20
Унатхов брали на погрузку, в ремонтные бригады и горячие цеха.

# beat:end

# layer:narration
# line:bar_city_21
После смены они сидели на бетонных ступенях, вытянув хвосты поперёк прохода, и ели из одинаковых металлических контейнеров.

# beat:end


# layer:unknown
# speaker:human_worker
# line:bar_city_voice_05
- До утра выдержит?

# beat:end


# layer:unknown
# speaker:unathi_worker
# line:bar_city_voice_06
- Ес-с-сли не трогать.

# beat:end


# layer:unknown
# speaker:human_worker
# line:bar_city_voice_07
- Его будут трогать.

# beat:end


# layer:unknown
# speaker:unathi_worker
# line:bar_city_voice_08
- Тогда не выдерш-ш-шит.

# beat:end


# layer:narration
# line:bar_city_22
# sfx:impact_distant
Где-то ударил молоток.

# beat:end


# layer:narration
# line:bar_city_23
Стакан перед Ниллом едва заметно дрогнул.

# beat:end


# layer:thought
# line:bar_city_24
Этот звук уже был.

# beat:end


# layer:thought
# line:bar_city_25
Не здесь.

# beat:end


# layer:narration
# line:bar_city_origin_06
Из города постоянно что-то увозили.
# beat:end


# layer:narration
# line:bar_city_origin_07
Руду.
# beat:end


# layer:narration
# line:bar_city_origin_08
Людей.
# beat:end


# layer:narration
# line:bar_city_origin_09
Деньги.
# beat:end


# layer:thought
# line:bar_city_origin_10
Назад возвращалось мало.
# beat:end


# layer:narration
# line:bar_city_26
Арахнидов было меньше остальных.

# beat:end

# layer:narration
# line:bar_city_27
Они селились ближе к производственным ярусам - там сдавали дешевле и реже спрашивали документы.

# beat:end


# layer:narration
# line:bar_city_28
Утром между пожарными лестницами блестели тонкие нити.

# beat:end

# layer:narration
# line:bar_city_29
Днём их срывали коммунальные дроны, прохожие и дети с палками.


# beat:end

# layer:narration
# line:bar_city_30
На следующее утро они появлялись снова.

# beat:end


# layer:archive
# line:bar_city_archive_03
В муниципальных отчётах паутина проходила как устойчивое бытовое загрязнение фасадов.

# beat:end


# layer:unknown
# speaker:arachnid
# line:bar_city_voice_09
- Не загрязнение это.

# beat:end


# layer:narration
# line:bar_city_31
. . . бытовое загрязнение.

# beat:end


# layer:narration
# line:bar_city_32
Город принимал новых жителей не сразу.

# beat:end


# layer:narration
# line:bar_city_33
Сначала предлагал койку возле трубы, смену на двенадцать часов. Начальники.

# beat:end


# layer:narration
# line:bar_city_34
Потом появлялись знакомый продавец, своё место в вагоне и человек за стойкой, который ворчал, но всё равно приносил вино.

# beat:end


# layer:narration
# line:bar_city_35
# sfx:shuttle
Над улицей прошёл шаттл.

# beat:end


# layer:narration
# line:bar_city_36
Стёкла задрожали.

# beat:end


# layer:narration
# line:bar_city_37
Или задрожало что-то другое.

# beat:end


# layer:narration
# line:bar_city_37b
Нилл попытался поймать, что именно, но ощущение уже разошлось по краям.

# beat:end


# layer:narration
# line:bar_city_38
На секунду исчез запах вина.

# beat:end


-> city_fracture


=== city_fracture ===

# fx:memory-drift
# background:city-archive


# layer:narration
# line:bar_city_39
Остался холодный металл.

# beat:end

# layer:thought
# line:bar_city_40
Ровный гул.

# beat:end


# layer:narration
# line:bar_city_41
Что-то туго охватывало левое запястье.

# beat:end


# layer:thought
# line:bar_city_42
Часы.

# beat:end


# layer:narration
# line:bar_city_43
Разумеется, часы.

# beat:end


# layer:narration
# line:bar_city_44
Синий свет по-прежнему показывал 02:43.

# beat:end


# layer:thought
# line:bar_city_45
Бар никуда не делся.

# beat:end


# layer:thought
# line:bar_city_46
Разумеется.

# beat:end


# layer:narration
# line:bar_city_47
За окнами снова шли люди.


# beat:end

# layer:narration
# line:bar_city_48
Люди, нианы, унатхи, арахниды.


# beat:end

# layer:narration
# line:bar_city_49
На работу. С работы. Домой. В место, которое пока называли домом.

# beat:end


# layer:archive
# line:bar_city_archive_04
Постоянное население района формировалось преимущественно из тех, кто первоначально не планировал оставаться.

# beat:end


# layer:thought
# line:bar_city_50
Все приезжали ненадолго.

# beat:end


# layer:thought
# line:bar_city_51
По крайней мере, считать иначе было грубостью.

# beat:end


* [Приёмный дом. Почти родной.]
~ city_attitude = "home"
-> district_home

* [Отвратительная дыра.]
~ city_attitude = "hole"
-> district_hole

* [Место, из которого ещё можно выбраться.]
~ city_attitude = "escape"
-> district_escape


=== district_home ===

# layer:thought
# line:bar_city_home_01
Приёмный дом.

# beat:end


# layer:thought
# line:bar_city_home_02
Почти родной.

# beat:end


# layer:archive
# line:bar_city_home_03
Постоянное население формировалось преимущественно из тех, кто первоначально не планировал оставаться.

# beat:end


# layer:thought
# line:bar_city_home_04
Вот и вся история.

# beat:end

-> district_choice


=== district_hole ===

# layer:thought
# line:bar_city_hole_01
Отвратительная дыра.

# beat:end


# layer:thought
# line:bar_city_hole_02
Его отвратительная дыра.

# beat:end


# layer:archive
# line:bar_city_hole_03
Уровень оттока населения оставался стабильно высоким.

# beat:end


# layer:thought
# line:bar_city_hole_04
Мне мало этого.

# beat:end

-> district_choice


=== district_escape ===

# layer:thought
# line:bar_city_escape_01
Место, из которого ещё можно выбраться.

# beat:end


# layer:archive
# line:bar_city_escape_02
Средняя продолжительность временного проживания -

# beat:end


# layer:narration
# line:bar_city_escape_03
Цифра не вспомнилась.

# beat:end


# layer:thought
# line:bar_city_escape_04
И хорошо.

# beat:end

-> district_choice


=== district_choice ===

# fx:memory-drift-end
# background:bar-soft

# layer:narration
# line:bar_city_return_01
Неоновая лампа над стойкой моргнула дважды.

# beat:end

# layer:narration
# line:bar_city_return_02
Город в стекле распался на блики; между ними снова проступил бар.

# beat:end


# layer:narration
# line:bar_city_return_03
Нилл вздрогнул.

# beat:end


* [- Здесь нет перспектив, Эд.]
-> district_original

* [- Для застройки перспективы не нужны.]
-> district_cynical

* [- Может, бар наконец выкупят.]
-> district_bar


=== district_original ===

# layer:dialogue
# speaker:nill
# line:bar_district_original_01
\- Здесь нет перспектив, Эд.

# beat:end


# layer:narration
# line:bar_district_original_02
Нилл наклонил голову к плечу и скрестил руки.

# beat:end


# layer:dialogue
# speaker:nill
# line:bar_district_original_03
\- Преступность, разруха. Слишком глубоко, чтобы вкладываться.

# beat:end

-> bar_will_stand


=== district_cynical ===

# layer:dialogue
# speaker:nill
# line:bar_district_cynical_01
\- Для застройки перспективы не нужны.

# beat:end


# layer:dialogue
# speaker:nill
# line:bar_district_cynical_02
\- Достаточно, чтобы земля кому-нибудь понадобилась.

# beat:end

-> bar_will_stand


=== district_bar ===

# layer:dialogue
# speaker:nill
# line:bar_district_bar_01
\- Может, бар наконец выкупят.

# beat:end


# layer:dialogue
# speaker:edward
# line:bar_district_bar_02
\- Может, я тебя продам вместе с мебелью.

# beat:end

-> bar_will_stand


=== bar_will_stand ===

# layer:narration
# line:bar_will_stand_01
Эдвард фыркнул и щёлкнул пальцами.

# beat:end


# layer:dialogue
# speaker:edward
# line:bar_will_stand_02
\- Перспектив нет, а бар мой всё равно стоит.

# beat:end


# layer:dialogue
# speaker:edward
# line:bar_will_stand_03
\- И стоять будет.

# beat:end


# layer:narration
# line:bar_will_stand_03b
Он сказал это с такой уверенностью, будто у бара был не владелец, а упрямый родственник.

# beat:end


# layer:narration
# line:bar_will_stand_04
Нилл молча покосился на него, приподняв антенны.

# beat:end


# layer:dialogue
# speaker:edward
# line:bar_industrialization_01
\- Слышал, верхние этажи начнут индустриализировать.

# beat:end


# layer:dialogue
# speaker:edward
# line:bar_industrialization_02
\- Жильцов постепенно сгонят всё ниже, к трущобам.

# beat:end


# layer:dialogue
# speaker:edward
# line:bar_industrialization_03
\- Если людей не останется - кого грабить?

# beat:end


* [- С одной стороны, не удивлюсь. С другой - слабо верится.]
-> industrialization_original

* [- Наверху всегда спихивают проблемы вниз.]
-> industrialization_down

* [- Найдут кого.]
-> industrialization_cynical


=== industrialization_original ===

# layer:narration
# line:bar_industrialization_original_01
Нилл потёр подбородок.

# beat:end


# layer:dialogue
# speaker:nill
# line:bar_industrialization_original_02
\- С одной стороны, не удивлюсь. С другой - слабо верится.

# beat:end

-> new_customer


=== industrialization_down ===

# layer:dialogue
# speaker:nill
# line:bar_industrialization_down_01
\- Наверху всегда находят способ спихнуть проблемы вниз.

# beat:end

-> new_customer


=== industrialization_cynical ===

# layer:dialogue
# speaker:nill
# line:bar_industrialization_cynical_01
\- Найдут кого.

# beat:end


# layer:dialogue
# speaker:nill
# line:bar_industrialization_cynical_02
\- Здесь даже пустые помещения умудряются обворовывать.

# beat:end

-> new_customer


=== new_customer ===

# layer:narration
# line:bar_new_customer_01
Эдвард пожал плечами.

# beat:end


# layer:narration
# line:bar_new_customer_02
Из его взгляда исчезла прежняя лёгкость.

# beat:end


# layer:narration
# line:bar_new_customer_02b
Эдвард умел веселиться с Ниллом и ругаться с ним одновременно. С другими посетителями он сначала считал расстояние до стойки.

# beat:end


# layer:narration
# line:bar_new_customer_03
# sfx:door
Дверь скрипнула.

# beat:end


# layer:narration
# line:bar_new_customer_04
В бар кто-то вошёл. Холодный воздух скользнул по полу.

# beat:end


# layer:dialogue
# speaker:edward
# line:bar_new_customer_05
\- Мм. Ну, мне пора.

# beat:end


# layer:narration
# line:bar_new_customer_06
# sfx:stand-up
Эдвард поднялся и скрипнул зубами, разминая челюсть.

# beat:end


# layer:dialogue
# speaker:edward
# line:bar_new_customer_07
\- И начинай уже расплачиваться за напитки. Я не шучу.

# beat:end


* [- Да-да. Я тоже тебя люблю.]
-> goodbye_original

* [- Когда разбогатею.]
-> goodbye_rich

* [- Запиши напоминание на мой счёт.]
-> goodbye_debt


=== goodbye_original ===

# layer:dialogue
# speaker:nill
# line:bar_goodbye_original_01
\- Да-да. Я тоже тебя люблю.

# beat:end


# layer:dialogue
# speaker:nill
# line:bar_goodbye_original_02
\- Иди уже, слуга двора.

# beat:end

-> memory_question


=== goodbye_rich ===

# layer:dialogue
# speaker:nill
# line:bar_goodbye_rich_01
\- Когда разбогатею.

# beat:end


# layer:dialogue
# speaker:edward
# line:bar_goodbye_rich_02
\- Тогда я точно ничего не получу.

# beat:end

-> memory_question


=== goodbye_debt ===

# layer:dialogue
# speaker:nill
# line:bar_goodbye_debt_01
\- Запиши напоминание на мой счёт.

# beat:end


# layer:dialogue
# speaker:edward
# line:bar_goodbye_debt_02
\- Ненавижу тебя.

# beat:end

-> memory_question


=== memory_question ===

# layer:narration
# line:bar_memory_question_01
# sfx:visitor-step-02
Эдвард сделал несколько шагов к стойке.

# beat:end


# layer:narration
# line:bar_memory_question_02
Он уже почти отошёл.

# beat:end


# layer:narration
# line:bar_memory_question_02b
Потом остановился.

# beat:end


# layer:dialogue
# speaker:edward
# line:bar_memory_question_03
\- Кстати.

# beat:end


# layer:narration
# line:bar_memory_question_04
Нилл поднял взгляд.

# beat:end


# layer:dialogue
# speaker:edward
# line:bar_memory_question_05
\- Кто первым полез?

# beat:end


# layer:narration
# line:bar_memory_question_06
Нилл посмотрел на стол.

# beat:end


# debug-choice:significant
* [- Я.]
~ fight_answer = "self"
-> fight_self

* [- Он.]
~ fight_answer = "other"
-> fight_other

* [- Не помню.]
~ fight_answer = "unknown"
-> fight_unknown


=== fight_self ===

# layer:dialogue
# speaker:nill
# line:bar_fight_self_01
\- Я.

# beat:end


# layer:narration
# line:bar_fight_self_01b
Ответ пришёл сразу.

# beat:end


# layer:narration
# line:bar_fight_self_02
Эдвард задержал на нём взгляд.

# beat:end


# layer:dialogue
# speaker:edward
# line:bar_fight_self_03
\- Надо же.

# beat:end


# layer:dialogue
# speaker:edward
# line:bar_fight_self_04
\- Сегодня без сказок.

# beat:end

-> memory_break


=== fight_other ===

# layer:dialogue
# speaker:nill
# line:bar_fight_other_01
\- Он.

# beat:end


# layer:narration
# line:bar_fight_other_01b
Ответ пришёл быстрее, чем он успел подумать.

# beat:end


# layer:dialogue
# speaker:edward
# line:bar_fight_other_02
\- Конечно.

# beat:end


# layer:narration
# line:bar_fight_other_03
Эдвард сказал это спокойно.

# beat:end


# layer:thought
# line:bar_fight_other_04
Почему-то это раздражало сильнее.

# beat:end

-> memory_break


=== fight_unknown ===

# layer:dialogue
# speaker:nill
# line:bar_fight_unknown_01
\- Не помню.

# beat:end


# layer:narration
# line:bar_fight_unknown_01b
Фраза осталась между ними.

# beat:end


# layer:dialogue
# speaker:edward
# line:bar_fight_unknown_02
\- Пожалуй, впервые верю.

# beat:end


# layer:thought
# line:bar_fight_unknown_03
Нилл не понял, была ли это насмешка.

# beat:end

-> memory_break


=== memory_break ===

# layer:narration
# line:bar_memory_break_01
Эдвард отвернулся к посетителю.

# beat:end

# layer:narration
# line:bar_memory_break_02
На его рубашке, возле локтя, белела неровная заплатка.

# layer:narration
# line:bar_memory_break_03
Один стежок разошёлся.

# beat:end


# layer:thought
# line:bar_memory_break_04
Надо будет перешить.

# beat:end


# layer:narration
# line:bar_memory_break_04b
Мысль пришла сама.

# beat:end


# palette:interruption-cold
# fx:memory-lock


# layer:narration
# line:bar_memory_break_05
Нилл снова вернулся к вопросу.

# beat:end


# layer:thought
# line:bar_memory_break_06
Кто первым полез?

# beat:end


# layer:narration
# line:bar_memory_break_07
# sfx:impact_distant
Он помнил удар.

# beat:end


# layer:narration
# line:bar_memory_break_08
Помнил руку у своего воротника.

# layer:narration
# line:bar_memory_break_08b
Скрип ножки кресла по полу.

# layer:narration
# line:bar_memory_break_08c
Банку под ботинком.

# beat:end


# layer:narration
# line:bar_memory_break_09
Помнил голос Эдварда.

# beat:end


# layer:thought
# line:bar_memory_break_10
Остановись.

# beat:end


# layer:narration
# line:bar_memory_break_11
Эдвард стоял у двери.

# beat:end


# layer:narration
# line:bar_memory_break_12
Посетитель только спускался с лестницы.

# beat:end


# layer:narration
# line:bar_memory_break_13
Банка всё ещё была у Нилла в руке.

# beat:end


# layer:thought
# line:bar_memory_break_14
Драка ещё не началась.

# beat:end


# layer:thought
# line:bar_memory_break_14b
Нет.

# layer:thought
# line:bar_memory_break_14c
Так не сходилось.

# beat:end


# layer:thought
# line:bar_memory_break_15
Наверное, он перепутал вечер.

# beat:end


# layer:narration
# line:bar_memory_break_16
Мысль легла на место.

# beat:end


# layer:narration
# line:bar_memory_break_16b
Слишком быстро.

# beat:end


# layer:narration
# line:bar_memory_break_17
Холод металла на левом запястье стал заметнее.

# beat:end


# layer:thought
# line:bar_memory_break_18
Часы.

# beat:end


# layer:narration
# line:bar_memory_break_19
Синие цифры показывали 02:43.

# beat:end


# layer:narration
# line:bar_memory_break_20
Они показывали 02:43 уже очень давно.

# beat:end


# layer:dialogue
# speaker:edward
# line:bar_memory_break_21
\- Нилл?

# beat:end


# layer:narration
# line:bar_memory_break_22
Голос Эдварда донёсся не со стороны двери.

# beat:end


# layer:narration
# line:bar_memory_break_23
На секунду Нилл перестал чувствовать запах дыма, вина и старой обивки.

# beat:end


# layer:narration
# line:bar_memory_break_24
# sfx:hollow
Остался только ровный гул.

# beat:end


# layer:dialogue
# speaker:edward
# line:bar_memory_break_25
\- Ты меня слышишь?

# beat:end


# layer:thought
# line:bar_memory_break_26
Конечно.

# beat:end


# layer:thought
# line:bar_memory_break_27
Эдвард стоял прямо перед ним.

# beat:end


# layer:narration
# line:bar_memory_break_28
Нилл поднял глаза.

# beat:end


# layer:narration
# line:bar_memory_break_29
Бар вернулся раньше, чем он успел заметить его отсутствие.

# beat:end


# layer:narration
# line:bar_memory_break_30
Эдвард стоял перед ним. Банка была в руке Нилла. Новый посетитель ждал у двери.

# beat:end


# layer:narration
# line:bar_memory_break_31
Всё снова занимало свои места.

# beat:end


# layer:unknown
# line:bar_unknown_01
Нилл запомнил этот вечер именно так.

# beat:end

-> END
