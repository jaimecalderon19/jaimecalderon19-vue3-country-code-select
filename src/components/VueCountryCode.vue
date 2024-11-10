<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import allCountries from '../utils/allCountries'
import getCountry from '../utils/defaultCountry'

interface BaseCountry {
  iso2: string
  name: string
  dialCode: string
}

// Extendemos BaseCountry para incluir la propiedad preferred opcional
interface Country extends BaseCountry {
  preferred?: boolean
}

interface DropdownOptions {
  disabledDialCode?: boolean
}

interface Props {
  disabledFetchingCountry?: boolean
  disabled?: boolean
  disabledFormatting?: boolean
  defaultCountry?: string
  enabledCountryCode?: boolean
  enabledFlags?: boolean
  preferredCountries?: string[]
  onlyCountries?: string[]
  ignoredCountries?: string[]
  dropdownOptions?: DropdownOptions
  selectedCountryCode?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  disabledFetchingCountry: false,
  disabled: false,
  disabledFormatting: false,
  defaultCountry: '',
  enabledCountryCode: false,
  enabledFlags: true,
  preferredCountries: () => [],
  onlyCountries: () => [],
  ignoredCountries: () => [],
  dropdownOptions: () => ({}),
  selectedCountryCode: false
})

const emit = defineEmits<{
  (event: 'onSelect', country: Country): void
}>()

// Reactive state
const activeCountry = ref<Country>({ iso2: '', name: '', dialCode: '' })
const open = ref(false)
const manualTrigger = ref(false)
const selectedIndex = ref<number | null>(null)
const typeToFindInput = ref('')
const typeToFindTimer = ref<number | null>(null)
const list = ref<HTMLUListElement | null>(null)

// Computed properties
const filteredCountries = computed(() => {
  if (props.onlyCountries.length) {
    return getCountries(props.onlyCountries)
  }

  if (props.ignoredCountries.length) {
    return allCountries.filter(
        ({ iso2 }) =>
            !props.ignoredCountries.includes(iso2.toUpperCase()) &&
            !props.ignoredCountries.includes(iso2.toLowerCase())
    )
  }

  return allCountries
})

const sortedCountries = computed((): Country[] => {
  const preferredCountries = getCountries(props.preferredCountries).map((country: Country) => ({
    ...country,
    preferred: true
  }))

  return [...preferredCountries, ...filteredCountries.value]
})

// Methods
const findCountry = (iso = ''): Country | undefined => {
  return allCountries.find(country => country.iso2 === iso.toUpperCase())
}

const getCountries = (list: string[] = []): Country[] => {
  return list
      .map(countryCode => findCountry(countryCode))
      .filter((country): country is Country => country !== undefined)
}

const getItemClass = (index: number, iso2: string) => {
  const highlighted = selectedIndex.value === index
  const lastPreferred = index === props.preferredCountries.length - 1
  const preferred = props.preferredCountries
      .map(c => c.toUpperCase())
      .indexOf(iso2) !== -1

  return {
    highlighted,
    'last-preferred': lastPreferred,
    preferred
  }
}

const choose = (country: Country) => {
  activeCountry.value = country
  emit('onSelect', activeCountry.value)
}

const toggleDropdown = () => {
  if (props.disabled) return
  open.value = !open.value
}

const clickedOutside = () => {
  if (manualTrigger.value) {
    manualTrigger.value = false
    return
  }
  open.value = false
}

const keyboardNav = (e: KeyboardEvent) => {
  if (e.keyCode === 40) { // down arrow
    open.value = true
    if (selectedIndex.value === null) {
      selectedIndex.value = 0
    } else {
      selectedIndex.value = Math.min(
          sortedCountries.value.length - 1,
          selectedIndex.value + 1
      )
    }
    scrollToSelectedOption()
  } else if (e.keyCode === 38) { // up arrow
    open.value = true
    if (selectedIndex.value === null) {
      selectedIndex.value = sortedCountries.value.length - 1
    } else {
      selectedIndex.value = Math.max(0, selectedIndex.value - 1)
    }
    scrollToSelectedOption()
  } else if (e.keyCode === 13) { // enter key
    if (selectedIndex.value !== null) {
      choose(sortedCountries.value[selectedIndex.value])
    }
    open.value = !open.value
  } else {
    // typing a country's name
    typeToFindInput.value += e.key
    if (typeToFindTimer.value) clearTimeout(typeToFindTimer.value)
    typeToFindTimer.value = window.setTimeout(() => {
      typeToFindInput.value = ''
    }, 700)

    const typedCountryI = sortedCountries.value
        .slice(props.preferredCountries.length)
        .findIndex(c =>
            c.name.toLowerCase().startsWith(typeToFindInput.value)
        )

    if (typedCountryI !== -1) {
      selectedIndex.value = props.preferredCountries.length + typedCountryI
      scrollToSelectedOption()
    }
  }
}

const scrollToSelectedOption = () => {
  if (!list.value || selectedIndex.value === null) return

  const selEle = list.value.children[selectedIndex.value] as HTMLElement
  if (!selEle) return

  if (
      selEle.offsetTop < list.value.scrollTop ||
      selEle.offsetTop + selEle.clientHeight >
      list.value.scrollTop + list.value.clientHeight
  ) {
    list.value.scrollTop = selEle.offsetTop - list.value.clientHeight / 2
  }
}

const reset = () => {
  selectedIndex.value = sortedCountries.value
      .map(c => c.iso2)
      .indexOf(activeCountry.value.iso2)
  open.value = false
}

// Lifecycle hooks and watchers
onMounted(async () => {
  // Initialize country
  if (props.defaultCountry) {
    const defaultCountry = findCountry(props.defaultCountry)
    if (defaultCountry) {
      activeCountry.value = defaultCountry
      emit('onSelect', activeCountry.value)
      return
    }
  }

  activeCountry.value = findCountry(props.preferredCountries[0]) || filteredCountries.value[0]

  if (!props.disabledFetchingCountry) {
    const countryCurrent = await getCountry();

    const country = findCountry(countryCurrent) || activeCountry.value
    choose(country)
  }

})

watch(() => props.defaultCountry, (newVal) => {
  const defaultCountry = findCountry(newVal)
  if (defaultCountry) {
    choose(defaultCountry)
  }
})
</script>

<template>
  <div class="vue-country-select" :class="{ disabled }">
    <div
        class="dropdown"
        @click="toggleDropdown"
        v-click-outside="clickedOutside"
        :class="{ open }"
        @keydown="keyboardNav"
        tabindex="0"
        @keydown.esc="reset"
    >
      <span class="current">
        <div
            v-if="enabledFlags"
            class="vti__flag"
            :class="activeCountry.iso2.toLowerCase()"
        />
        <span v-if="enabledCountryCode" class="country-code">
          +{{ activeCountry.dialCode }}
        </span>
        <span class="dropdown-arrow">{{ open ? "▲" : "▼" }}</span>
      </span>
      <ul v-show="open" ref="list" class="dropdown-list">
        <li
            v-for="(pb, index) in sortedCountries"
            :key="pb.iso2 + (pb.preferred ? '-preferred' : '')"
            class="dropdown-item"
            :class="getItemClass(index, pb.iso2)"
            @click="choose(pb)"
            @mousemove="selectedIndex = index"
        >
          <div
              v-if="enabledFlags"
              class="vti__flag"
              :class="pb.iso2.toLowerCase()"
          />
          <strong style="font-weight: 500">{{ pb.name }}</strong>
          <span v-if="dropdownOptions && !dropdownOptions.disabledDialCode">
            +{{ pb.dialCode }}
          </span>
        </li>
      </ul>
    </div>
  </div>
</template>
<style src="../assets/sprite.css"></style>
<style>
/* TODO: Find the right way to resolve alias in style block */
/* @import url("~@/assets/sprite.css"); */
.vue-country-select {
  border-radius: 3px;
  display: inline-block;
  border: 1px solid #bbb;
  text-align: left;
}
.vue-country-select:focus-within {
  box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075),
  0 0 8px rgba(102, 175, 233, 0.6);
  border-color: #66afe9;
}
.vue-country-select .dropdown {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 0.5em;
  position: relative;
  cursor: pointer;
}
.vue-country-select .dropdown.open {
  background-color: #f3f3f3;
}
.vue-country-select .dropdown:hover {
  background-color: #f3f3f3;
}
.vue-country-select .dropdown-list {
  z-index: 1;
  padding: 0;
  margin: 0;
  text-align: left;
  list-style: none;
  max-height: 200px;
  overflow-y: scroll;
  position: absolute;
  top: 100%;
  left: -1px;
  background-color: #fff;
  border: 1px solid #ccc;
  width: 390px;
}
.vue-country-select .dropdown-item {
  cursor: pointer;
  padding: 4px 15px;
}
.vue-country-select .dropdown-item .iti-flag {
  display: inline-block;
  margin-right: 5px;
  margin-left: 5px;
}
.vue-country-select .dropdown-item.highlighted {
  background-color: #f3f3f3;
}
.vue-country-select .dropdown-item.last-preferred {
  border-bottom: 1px solid #cacaca;
}
.vue-country-select .dropdown-arrow {
  transform: scaleY(0.5);
  display: inline-block;
  color: #666;
}
.vue-country-select .current {
  font-size: 0.8em;
  display: flex;
  align-items: center;
}
.vue-country-select .country-code {
  color: #666;
}
.vue-country-select.disabled .current,
.vue-country-select.disabled .dropdown {
  cursor: no-drop;
}
</style>