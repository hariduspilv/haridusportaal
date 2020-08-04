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
    type: 'textarea',
    disabled: 'true',
    title: 'Disabled textarea',
    value: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum. Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum. Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum. Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.'
  },
  {
    type: 'number',
    title: 'Number field',
    errorMessage: 'Please fill this field!',
  },
  {
    type: 'date',
    title: 'Datepicker field Datepicker field Datepicker field Datepicker field Datepicker field',
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
    type: 'select',
    placeholder: 'Select a value',
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
