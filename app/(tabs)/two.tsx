import { Button, Box, Flex } from "native-base";
import { Formik } from 'formik';
import React from 'react';
import { TextInput, Text, StyleSheet } from 'react-native';
import QRCode from "react-native-qrcode-svg";
import * as Yup from 'yup';
const QRForm = React.forwardRef(
    function (props, ref) {
        const { label, labelStyle, error, ...inputProps } = props;

        const validationSchema = Yup.object().shape({
            name: Yup.string().required('Pet name is required'),
            OwnerName: Yup.string().required("Owner's name is required"),
            add: Yup.string().required("Pet's address is required"),
            phno: Yup.string().required("Owner's contact number is required"),
        });
        const [formData, setFormData] = React.useState(null);
return (
        <Flex>
            <Flex align="center">

                <Formik
                    initialValues={{
                        name: "",
                        OwnerName: "",
                        phno: "",
                        add: ""
                    }}
                    validationSchema={validationSchema}
                    onSubmit={(values, { resetForm }) => {
                        setFormData(values);
                        console.log(formData);
                        resetForm();

                    }}
                >
                    {({ handleChange, handleBlur, handleSubmit, values, errors }) => (
                        <>
                            {label && <Text style={[styles.label, labelStyle]}>{label}</Text>}

                            <TextInput
                                autoCapitalize="none"
                                placeholder='Pet Name'
                                ref={ref}
                                onChangeText={handleChange('name')}
                                onBlur={handleBlur('name')}
                                value={values.name}
                                style={[
                                    styles.inputContainer,
                                    { borderColor: errors.name ? '#fc6d47' : '#c0cbd3' },
                                ]}
                            />
                            {errors.name && <Text style={styles.textError}>{errors.name}</Text>}

                            <TextInput
                                autoCapitalize="none"
                                placeholder="Owner's Name"
                                ref={ref}
                                onChangeText={handleChange('OwnerName')}
                                onBlur={handleBlur('OwnerName')}
                                value={values.OwnerName}
                                style={[
                                    styles.inputContainer,
                                    { borderColor: errors.OwnerName ? '#fc6d47' : '#c0cbd3' },
                                ]}
                            />
                            {errors.OwnerName && <Text style={styles.textError}>{errors.OwnerName}</Text>}

                            <TextInput
                                autoCapitalize="none"
                                placeholder="Pet's Address"
                                ref={ref}
                                onChangeText={handleChange('add')}
                                onBlur={handleBlur('add')}
                                value={values.add}
                                style={[
                                    styles.inputContainer,
                                    { borderColor: errors.add ? '#fc6d47' : '#c0cbd3' },
                                ]}
                            />
                            {errors.add && <Text style={styles.textError}>{errors.add}</Text>}

                            <TextInput
                                autoCapitalize="none"
                                placeholder="Owner's Contact Number"
                                ref={ref}
                                onChangeText={handleChange('phno')}
                                onBlur={handleBlur('phno')}
                                value={values.phno}
                                style={[
                                    styles.inputContainer,
                                    { borderColor: errors.phno ? '#fc6d47' : '#c0cbd3' },
                                ]}
                            />
                            {errors.phno && <Text style={styles.textError}>{errors.phno}</Text>}

                            <Button onPress={handleSubmit} my="5" colorScheme="orange" w="280px">
                                Create Qr
                            </Button>
                        </>
                    )}

                </Formik>
                {formData && <Flex align="center" w="full" mb="20px">
                    <QRCode size={200} value={JSON.stringify(formData)} />
                </Flex>
                }
            </Flex>
        </Flex>
);
    }
);

export default QRForm;

const styles = StyleSheet.create({
    container: {
        // Your container styles
        marginBottom: 10,
    },
    label: {
        // Your label styles
        marginBottom: 5,
    },
    inputContainer: {
        // Your input container styles
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        paddingVertical: 8,
        width: 280,
        marginTop: 20,
    },
    textError: {
        // Your text error styles
        color: '#fc6d47',
        marginTop: 5,
    },
});
