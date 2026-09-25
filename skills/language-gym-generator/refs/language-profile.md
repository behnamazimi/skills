# Language profile

Step 0 fills in `spec.profile` (the target language) and `spec.learner_profile` (the language used for explanations) for **any** language, by answering the questions below. The scripts read only these fields and never look at language names. The worked examples show how to answer; they are not a list of supported languages.

## Questions (answer each for the specific variety being taught)

1. **`locale`**: a BCP 47 tag for the variety, as specific as the dialect (`es-419`, `pt-BR`, `ar`, `arz` for Egyptian Arabic, `zh-Hans`, `yue-Hant`, `sr-Latn`, `la`). It drives word and sentence splitting and case-folding.
2. **`scripts`**: ISO 15924 codes for the script(s) the glossary writes the target in. Pick **one** convention when a language has several (Serbian Cyrl or Latn; Hindi Deva, not Urdu Arab), and record it in `dialect`. Use `Jpan` for Japanese (kanji + kana), `Kore` for Korean, `Hans`/`Hant` for Chinese.
3. **`direction`**: `ltr` or `rtl`.
4. **`cased`**: does the script have upper and lower case? (Latin, Cyrillic, Greek, Armenian: yes. Arabic, Hebrew, Han, kana, Devanagari: no.)
5. **`word_separated`**: are words written with spaces between them? (Chinese, Japanese, Thai, Lao, Khmer, Burmese: no.) It only tells step writers what to expect; the script splits words for any language anyway.
6. **`diacritics_meaningful`**: can an accent or mark alone change the word (Spanish `si`/`sí`, Vietnamese tones, Arabic short vowels when written)? If yes, possible exclude matches that differ only in marks need an agent's decision (**R-EX-04**).
7. **`articles`**: separate words that come before a noun in its citation form and that exclude matching should ignore (`el, la, los, las, un, una`; `der, die, das`; `ال` is attached to the word in Arabic, so list it only if the dictionary form includes it). Leave it empty when there are none.
8. **`noun_citation`**: the one noun format used for the whole glossary (**R-TERM-04**): "bare lemma", "lemma + article" (`de tafel`, when gender isn't predictable and learners study it that way), "singular + class prefix" (Swahili), "noun + counter noted in discussion" (Japanese).
9. **`pronunciation_convention`**: what `ipa` means for this language, e.g. "IPA", "IPA with Chao tone letters", "IPA, broad transcription, Tehrani standard". What `spoken` means: an informal stress hint, or the standard learner romanization (pinyin with tone marks, Hepburn, Revised Romanization).
10. **`politeness_marked`**: does the grammar itself mark politeness (verb endings or levels, as in Japanese or Korean), rather than only word choice? If yes, R-SEL-12 adds a `politeness` job.
11. **Grammar notes for selection** (free text, `profile.grammar_notes`): how this language does each **R-SEL-12** job (a copula or a zero copula, existence verb, politeness levels, noun classes, counters, cases, aspect rather than tense, evidentials…). Also the closed sets it has. Selection turns these into jobs.

`learner_profile` needs only `locale`, `scripts`, `direction`, `cased` and `word_separated`. Under immersion it equals `profile`.

## Worked examples

| Variety | locale | scripts | dir | cased | spaced | marks matter | articles | noun_citation | pronunciation |
|---|---|---|---|---|---|---|---|---|---|
| Latin American Spanish | `es-419` | Latn | ltr | yes | yes | yes | el, la, los, las, un, una | bare lemma | IPA; spoken = stress hint |
| Standard Mandarin | `zh-Hans` | Hans | ltr | no | no | yes (tones) | none | bare noun (measure word in discussion) | IPA with Chao tone letters; spoken = pinyin |
| Modern Standard Arabic | `ar` | Arab | rtl | no | yes | yes when vowel marks are written | none (ال is attached) | bare singular, with vowel marks on terms | IPA; spoken = simple Latin transliteration |
| Egyptian Arabic | `arz` | Arab | rtl | no | yes | yes | none | bare singular | IPA (Cairene) |
| Japanese | `ja` | Jpan | ltr | no | no | no | none | dictionary form; counters noted in discussion | IPA; spoken = Hepburn |
| Turkish | `tr` | Latn | ltr | yes (dotted/dotless i) | yes | yes | none | bare lemma | IPA |
| Swahili | `sw` | Latn | ltr | yes | yes | no | none | singular with class prefix | IPA |
| Serbian (Latin script) | `sr-Latn` | Latn | ltr | yes | yes | yes | none | bare lemma | IPA with pitch accent optional |
| Classical Latin | `la` | Latn | ltr | yes | yes | yes (macrons in terms) | none | nominative + genitive ending (`rosa, -ae`) | Classical IPA |

**Grammar-note examples:**
- **Mandarin:** no tense, but aspect markers 了/过/着; 是 for identity and 有 for existence/possession; measure words are a closed set per noun; questions with 吗 or A-not-A.
- **Swahili:** noun classes come in singular/plural pairs (closed sets); subject and tense prefixes on the verb; `kuna/pana/mna` for existence.
- **Japanese:** politeness is marked (です/ます vs plain form); particles は/が/を/に/で are a closed core set; counters.
- **Arabic:** there is no present-tense copula; `هناك` for existence; the dual; the choice between standard and dialect is part of the spec.

## Hard or unusual cases

- **Dialect as the domain** (`Cantonese`, `Swiss German`): the dialect *is* the target. Record its usual written form (e.g. written Cantonese characters) in `dialect`, and use its own locale when one exists.
- **Classical or dead languages:** `slice_type: reading`. There's no dialect question; name the period ("Classical Latin, Ciceronian norms").
- **Constructed languages** (Esperanto, Toki Pona): answer the same questions. Toki Pona's closed word list makes **R-SEL-04** apply to nearly everything.
- **Learner language isn't English**: fill `learner_profile` the same way. Category labels, banned phrases and opening-word rules then work in that language.
- **Low-resource languages:** fill in what's known and write `"uncertain": ["field", …]` for the rest. Step 9's fact questions will be stricter, and entries marked "unsure" there are dropped (see `steps/09-check.md`).
