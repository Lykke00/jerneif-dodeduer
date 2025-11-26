import { Button, Card, CardBody, CardFooter, CardHeader, Form, Input } from '@heroui/react';
import { motion } from 'framer-motion';
import { useState, type FormEvent } from 'react';
import { isValidEmail } from '../../helpers/isValidEmail';

export default function IndexPage() {
  const [email, setEmail] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  const canSubmit = isValidEmail(email);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSubmitSuccess(true);
    setTimeout(() => {
      setEmail('');
      setSubmitSuccess(false);
      setIsSubmitting(false);
    }, 2000);
  };

  return (
    <div className="h-full bg-linear-to-b pt-2 from-background via-background to-secondary/20 dark:from-background dark:via-background dark:to-secondary/30 flex flex-col items-center justify-start transition-colors duration-300">
      <div className="w-[30rem] p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Card className="p-4 border border-primary/30 shadow-lg backdrop-blur-sm bg-card/80 dark:bg-card/60">
            <CardHeader className="border-b border-primary/10 pb-4">
              <div className="flex w-full text-center flex-col items-start justify-start">
                <p className="text-3xl font-bold text-foreground-800 mb-1">Login</p>
                <p className="text-sm text-foreground-700">
                  Indtast din e-mail adresse for at modtage et link.
                </p>
              </div>
            </CardHeader>

            <Form validationErrors={errors} onSubmit={onSubmit}>
              <CardBody className="p-4">
                <Input
                  isRequired
                  isDisabled={isSubmitting}
                  label="Email"
                  placeholder="Skriv din email adresse"
                  type="email"
                  onValueChange={setEmail}
                  classNames={{
                    inputWrapper: 'border-primary/20 border',
                  }}
                />
              </CardBody>

              <CardFooter className="border-primary/10 pt-1 flex flex-col">
                <Button
                  isLoading={isSubmitting}
                  type="submit"
                  className="w-full h-12 text-lg font-bold bg-linear-to-r from-primary to-red-400 dark:from-primary dark:to-red-400 hover:from-primary/90 hover:to-red-400/90 text-primary-foreground dark:text-primary-foreground shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <motion.span key="submit" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    Login
                  </motion.span>
                </Button>
              </CardFooter>
            </Form>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
