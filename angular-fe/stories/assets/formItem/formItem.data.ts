export const formItems = [
  {
    type: 'text',
    title: 'Text field',
    errorMessage: 'Please fill this field!',
  },
  {
    type: 'text',
    titleDisabled: 'true',
    placeholder: 'Text field with disabled title',
    errorMessage: 'Please fill this field!',
  },
  {
    type: 'text',
    disabled: 'true',
    title: 'Disabled text field',
  },
  {
    type: 'number',
    title: 'Number field',
    errorMessage: 'Please fill this field!',
  },
  {
    type: 'date',
    title: 'Datepicker field Datepicker field Datepicker field Datepicker field Datepicker field',
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
      {
        key: 'Option 5',
        value: '5',
      },
      {
        key: 'Option 6',
        value: '6',
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
    errorMessage: 'Write something!',
  },
];
