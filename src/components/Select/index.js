import styles from './Select.module.scss'
import _ from 'lodash'
import classNames from 'classnames'
import React, { useRef, useEffect, useState, forwardRef } from 'react'
import PropTypes from 'prop-types'

const Label = ({ children, handleRemove }) => (
  <div className={styles.label} onClick={handleRemove}>
    {children}
  </div>
)

const SelectBase = ({
  searchable,
  placeholder,
  onClick,
  selected,
  loading,
  disabled,
  searchNode,
  handleRemove,
  open,
  className,
  ...otherProps
}) => {
  const valueIsSet = Array.isArray(selected) ? selected.length > 0 : !!selected
  const classes = classNames(
    styles.base,
    { [styles.singleBase]: !Array.isArray(selected) },
    { [styles.noItems]: !valueIsSet },
    { [styles.loading]: loading },
    { [styles.disabled]: disabled }
  )
  const renderValue = Array.isArray(selected)
    ? selected.map(item => <Label handleRemove={handleRemove(item.value)} key={item.value}>{item.text}</Label>)
    : selected && selected.text
  return (
    <div
      tabIndex={0}
      onClick={!disabled && onClick}
      className={`${classes} ${className || ''}`}
      {...otherProps}
    >
      {valueIsSet ? renderValue : (!searchable && placeholder)}
      {searchable && <div contentEditable={true} placeholder={placeholder} className={styles.search} ref={searchNode} />}
    </div>
  )
}

const Select = forwardRef(({
  className,
  size,
  allowCustom,
  loading,
  searchable,
  options,
  onChange,
  onBlur,
  onKeyUp,
  onKeyDown,
  style,
  multiple,
  name,
  defaultValue,
  value,
  ...otherProps
}, ref) => {
  const defaults = multiple ? [] : undefined
  const mainNode = useRef()
  const searchNode = useRef()
  const [open, setOpen] = useState(false)
  const [searchQuery, setQuery] = useState(false)
  const [selected, selectItem] = useState(value || defaultValue || defaults)
  const [filteredOptions, setOptions] = useState(options)
  const [highlightedIndex, setHighlighted] = useState(allowCustom ? -1 : 0)

  if (ref) ref.current = { value: Array.isArray(selected) ? selected.map(v => v.value) : (selected && selected.value) }

  const handleClick = ({ target }) => {
    if (mainNode.current && mainNode.current.contains(target)) return
    setOpen(false)
  }

  const handleSelect = selectedValue => () => {
    selectedValue = typeof selectedValue === 'string' ? { value: selectedValue, text: selectedValue } : selectedValue
    if (multiple) {
      const value = selected.map(o => o.value).includes(selectedValue.value)
        ? selected.filter(item => item.value !== selectedValue.value)
        : selected.concat(selectedValue)
      selectItem(value)
    } else {
      selectItem(selectedValue)
      setOpen(false)
    }
    if (searchNode.current) {
      searchNode.current.textContent = ''
      setQuery(false)
    }
  }

  const toggleOpen = () => {
    setOpen(!open)
  }

  const search = query => {
    if (!query) return setOptions(options)
    const results = options.filter(option => {
      const toSearch = typeof option === 'string' ? option : option.text
      return toSearch.toLowerCase().includes(query.toLowerCase())
    })
    setHighlighted(0)
    setQuery(query)
    setOptions(results)
  }

  const handleRemove = val => e => {
    e.stopPropagation()
    selectItem(selected.filter(item => item.value !== val))
  }

  const selectPrev = () => {
    if (highlightedIndex > -1) {
      setHighlighted(highlightedIndex - 1)
    }
  }

  const selectNext = () => {
    if (filteredOptions[highlightedIndex + 1]) {
      setHighlighted(highlightedIndex + 1)
    }
  }

  const handleEnter = customText => {
    const selectedItem = filteredOptions[highlightedIndex]
    if (selectedItem) {
      handleSelect(selectedItem)()
    } else if (allowCustom && searchable) {
      handleSelect({ text: customText, value: customText })()
    }
  }

  const handleKeyUp = e => {
    const keyEventHandlers = {
      27: setOpen, // esc key
      38: selectPrev, // up key
      40: selectNext, // down key
      13: () => handleEnter(e.target.textContent) // enter key
    }

    if (!open) setOpen(true)
    else if (keyEventHandlers.hasOwnProperty(e.keyCode)) keyEventHandlers[e.keyCode]()
    else if (searchable) search(e.target.textContent)

    if (onKeyUp) {
      onKeyUp(e)
    }
  }

  const handleKeyDown = e => {
    const enterKey = 13
    const upKey = 38
    const downKey = 40
    if (onKeyDown) {
      return onKeyDown(e)
    } else if (e.keyCode === enterKey || e.keyCode === upKey || e.keyCode === downKey) {
      e.preventDefault()
      return false
    }
  }

  useEffect(() => {
    if (searchNode.current && searchable) {
      searchNode.current.focus()
      if (!open) {
        searchNode.current.textContent = ''
        setQuery(false)
      }
    }
    const event = {
      target: {
        name,
        value: multiple ? selected.map(item => item.value) : (selected && selected.value)
      }
    }
    if (onChange) {
      onChange(event)
    }
    if (onBlur) {
      onBlur(event)
    }
    document.addEventListener('mousedown', handleClick)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      setOptions(options)
    }
  }, [open, selected])

  const renderOption = (option, i) => {
    option = typeof option === 'string' ? { text: option, value: option } : option
    const isSelected = multiple ? selected.map(o => o.value).includes(option.value) : (selected && selected.value === option.value)
    const isHighlighted = i === highlightedIndex
    const classes = classNames(
      { [styles.selected]: isSelected },
      { [styles.highlighted]: isHighlighted }
    )

    return (
      <div key={option.value} onClick={handleSelect(option)} className={classes}>
        {option.text}
      </div>
    )
  }

  const classes = classNames(
    styles.root,
    { [styles.open]: open }
  )

  return (
    <div className={classes} ref={mainNode} style={style}>
      <SelectBase open={open} selected={selected} loading={loading} searchable={searchable} searchNode={searchNode} {...otherProps} onKeyUp={handleKeyUp} onKeyDown={handleKeyDown} handleRemove={handleRemove} onClick={toggleOpen} className={className} />
      {open && <div className={styles.picker}>
        {allowCustom && searchQuery && (
          <div onClick={handleSelect(searchQuery)} className={highlightedIndex === -1 ? styles.highlighted : ''}>
            + Add <strong>{searchQuery}</strong>
          </div>
        )}
        {filteredOptions && filteredOptions.map(renderOption)}
      </div>}
    </div>
  )
})

Select.propTypes = {
  /** Array of strings or objects {text, value} representing the options */
  options: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.string),
    PropTypes.arrayOf(PropTypes.object)
  ]).isRequired,
  /** Whether to show a loading spinner */
  loading: PropTypes.bool,
  /** Whether to allow selecting multiple items */
  multiple: PropTypes.bool,
  /** Whether to allow text filtering */
  searchable: PropTypes.bool
}

export default Select
