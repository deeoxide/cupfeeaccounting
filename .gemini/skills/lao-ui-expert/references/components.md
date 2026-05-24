# Lao UI Component Library

Common UI patterns used in the Lao SME Accounting app.

## Cards

Standard container for dashboard items and form sections.

```jsx
<div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
  <h2 className="text-lg font-bold text-gray-800 mb-4">Header (ຫົວຂໍ້)</h2>
  <p className="text-sm text-gray-500">Content goes here...</p>
</div>
```

## Buttons

### Primary Action

```jsx
<button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-6 rounded-xl transition shadow-sm">
  Action Name (ຊື່ປຸ່ມ)
</button>
```

### Secondary/Ghost Action

```jsx
<button className="text-blue-600 hover:bg-blue-50 font-semibold px-4 py-2 rounded-lg transition">
  Secondary (ຕົວເລືອກຮອງ)
</button>
```

## Form Inputs

```jsx
<div>
  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Label (ຊື່ຊ່ອງໃສ່ຂໍ້ມູນ)</label>
  <input 
    type="text" 
    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium" 
    placeholder="Placeholder (ຄຳແນະນຳ)"
  />
</div>
```

## Stats Card

```jsx
<div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
  <div className="absolute top-0 right-0 bg-blue-50 w-24 h-24 rounded-bl-full -mr-4 -mt-4 opacity-50"></div>
  <p className="text-sm font-medium text-gray-500 mb-1 relative z-10">Label (ລາຍການ)</p>
  <p className="text-3xl font-bold text-gray-900 relative z-10">
    1,000,000 <span className="text-lg font-medium">₭</span>
  </p>
</div>
```

## Navigation Items

```jsx
<button className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all ${active ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'}`}>
  <Icon className="w-5 h-5" />
  <span>Label (ເມນູ)</span>
</button>
```
