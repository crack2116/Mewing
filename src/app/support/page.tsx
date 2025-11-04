'use client';
import { useState, useRef, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SendHorizonal, Bot, User, Loader2 } from 'lucide-react';
import { virtualAssistant, AssistantInput } from '@/ai/flows/assistant-flow';
import ReactMarkdown from 'react-markdown';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

type Message = {
  role: 'user' | 'model';
  parts: { text: string }[];
};

const faqData = [
    {
        question: "¿Cómo puedo rastrear mi paquete?",
        answer: "Puedes rastrear tu paquete en tiempo real utilizando la sección de 'Seguimiento' en el menú. Solo necesitas el ID de tu servicio o vehículo."
    },
    {
        question: "¿Cuáles son sus horarios de atención?",
        answer: "Nuestro equipo de soporte está disponible de Lunes a Viernes, de 9 AM a 6 PM. El asistente virtual está disponible 24/7."
    },
    {
        question: "¿Cómo puedo crear una nueva solicitud de servicio?",
        answer: "Ve a la sección de 'Servicios' en el menú y haz clic en el botón 'Crear Nueva Solicitud'. Deberás llenar los detalles del origen, destino y cliente."
    },
    {
        question: "¿Qué tipo de carga transportan?",
        answer: "Transportamos una amplia variedad de carga, incluyendo paquetería, carga seca, productos refrigerados y materiales peligrosos. Para requerimientos especiales, por favor contacta a nuestro equipo."
    }
]

export default function SupportPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', parts: [{ text: input }] };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const assistantInput: AssistantInput = {
        prompt: input,
        history: messages,
      };

      const responseText = await virtualAssistant(assistantInput);
      const modelMessage: Message = { role: 'model', parts: [{ text: responseText }] };
      setMessages((prev) => [...prev, modelMessage]);
    } catch (error: any) {
      console.error('Error calling assistant:', error);
      const errorMessage: Message = {
        role: 'model',
        parts: [{ 
          text: error?.message?.includes('no está configurado') 
            ? error.message 
            : 'Lo siento, ha ocurrido un error. Por favor, intenta de nuevo más tarde o consulta nuestras preguntas frecuentes.' 
        }],
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-3xl font-bold font-headline tracking-tight">Soporte</h1>
        <p className="text-muted-foreground">
          Encuentra respuestas a tus preguntas y obtén asistencia.
        </p>
      </div>

      <Tabs defaultValue="assistant" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="assistant">Asistente Virtual</TabsTrigger>
          <TabsTrigger value="faq">Preguntas Frecuentes</TabsTrigger>
        </TabsList>
        <TabsContent value="assistant">
          <Card className="h-[70vh]">
            <CardContent className="h-full flex flex-col p-4">
              <ScrollArea className="flex-1 pr-4" ref={scrollAreaRef}>
                <div className="space-y-6">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex items-start gap-4 ${
                        message.role === 'user' ? 'justify-end' : ''
                      }`}
                    >
                      {message.role === 'model' && (
                        <Avatar className="h-9 w-9 border">
                          <AvatarFallback><Bot className="h-5 w-5" /></AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={`max-w-xl p-3 rounded-lg ${
                          message.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <ReactMarkdown className="prose dark:prose-invert text-sm leading-relaxed">
                          {message.parts[0].text}
                        </ReactMarkdown>
                      </div>
                      {message.role === 'user' && (
                         <Avatar className="h-9 w-9 border">
                          <AvatarFallback><User className="h-5 w-5" /></AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ))}
                   {messages.length === 0 && (
                     <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8">
                        <Bot className="h-12 w-12 mb-4" />
                        <h2 className="text-xl font-semibold">Bienvenido al Asistente Virtual</h2>
                        <p className="mt-2">Soy MewBot, ¿cómo puedo ayudarte hoy?</p>
                     </div>
                   )}
                </div>
              </ScrollArea>
              <form
                onSubmit={handleSendMessage}
                className="mt-4 flex items-center gap-2 border-t pt-4"
              >
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Pregunta sobre nuestros servicios..."
                  className="flex-1"
                  disabled={isLoading}
                />
                <Button type="submit" size="icon" disabled={isLoading}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <SendHorizonal className="h-4 w-4" />}
                  <span className="sr-only">Enviar</span>
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="faq">
            <Card>
                <CardHeader>
                    <CardTitle>Preguntas Frecuentes</CardTitle>
                    <CardDescription>Encuentra respuestas rápidas a las preguntas más comunes.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                        {faqData.map((item, index) => (
                            <AccordionItem value={`item-${index}`} key={index}>
                                <AccordionTrigger>{item.question}</AccordionTrigger>
                                <AccordionContent>
                                    {item.answer}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
