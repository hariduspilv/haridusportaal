export const formItems = [
  {
    type: 'text',
    title: 'Text field',
    value: 'Initial value', /* Testing initial value */
  },
  {
    type: 'text',
    title: 'Text field with placeholder',
    placeholder: 'Start Typing',
  },
  {
    type: 'date',
    title: 'Datepicker field',
    placeholder: 'pp.kk.aaaa',
  },
  {
    type: 'select',
    title: 'Select',
    placeholder: 'Select an option',
    options: [
      {
        key: 'Option 1',
        value: '1',
      },
      {
        key: 'Option 2',
        value: '2',
      },
      {
        key: 'Option 3',
        value: '3',
      },
      {
        key: 'Option 4',
        value: '4',
      },
    ],
  },
  {
    type: 'textarea',
    title: 'Textarea',
    placeholder: 'You can express yourself here...',
  },
];
