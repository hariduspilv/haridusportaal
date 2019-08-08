export const formItems = [
  {
    type: 'text',
    title: 'Text field',
    errorMessage: 'Please fill this field!'
  },
  {
    type: 'text',
    title: 'Text field with placeholder',
    placeholder: 'Start Typing',
    errorMessage: 'Minimum 8 characters!',
  },
  {
    type: 'date',
    title: 'Datepicker field',
    placeholder: 'pp.kk.aaaa',
    errorMessage: 'Wrong date format!',
  },
  {
    type: 'multi-select',
    title: 'Multiselect',
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
    errorMessage: 'Please select at least 1 value!',
  },
  {
    type: 'select',
    title: 'Select',
    options: [
      {
        key: 'Select an option',
        value: '',
      },
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
    errorMessage: 'This field is required!',
  },
  {
    type: 'checkbox',
    label: 'Option',
    errorMessage: 'You MUST agree to our terms!',
  },
  {
    type: 'radio',
    title: 'Radiobuttons',
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
    errorMessage: 'Select at least 1 option!',
  },
  {
    type: 'textarea',
    title: 'Textarea',
    placeholder: 'You can express yourself here...',
    errorMessage: 'Write something!',
  },
];
