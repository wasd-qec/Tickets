import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import StatusBadge from '../components/StatusBadge.vue'
import PriorityBadge from '../components/PriorityBadge.vue'

describe('StatusBadge', () => {
  it('renders Open status badge with correct text and class', () => {
    const wrapper = mount(StatusBadge, {
      props: { status: 'OPEN' },
    })
    expect(wrapper.text()).toBe('Open')
    expect(wrapper.classes()).toContain('stage-blue')
  })

  it('renders In Progress status badge with correct text and class', () => {
    const wrapper = mount(StatusBadge, {
      props: { status: 'IN_PROGRESS' },
    })
    expect(wrapper.text()).toBe('In Progress')
    expect(wrapper.classes()).toContain('stage-orange')
  })
})

describe('PriorityBadge', () => {
  it('renders High priority badge with correct text and class', () => {
    const wrapper = mount(PriorityBadge, {
      props: { priority: 'HIGH' },
    })
    expect(wrapper.text()).toBe('High')
    expect(wrapper.classes()).toContain('priority-red')
  })
})
