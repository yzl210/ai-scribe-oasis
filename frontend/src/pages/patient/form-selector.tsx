import {useState} from 'react';
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,} from '@/components/ui/dialog';
import {Button} from '@/components/ui/button';
import {Plus} from 'lucide-react';
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from '@/components/ui/card';
import {Form, FORMS} from '../../../../shared/forms.ts';
import {ScrollArea} from '@/components/ui/scroll-area';
import {Badge} from '@/components/ui/badge';
import {Note} from '@ai-scribe-oasis/shared/types';
import {requestJson} from '@/lib/api.ts';
import {toast} from 'sonner';

export function FormSelector({note}: { note: Note }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSelectTemplate = async (form: Form) => {
        if (loading) return;
        setLoading(true);
        try {
            await requestJson(`/notes/${note.id}/form`, 'POST', {form});
            setOpen(false);
        } catch (err) {
            toast.error('Failed to add form', {
                description: String(err),
            });
        } finally {
            setLoading(false);
        }
    };

    const forms = Object.values(FORMS)
        .filter((form) => !note.forms || !Object.keys(note.forms).includes(form.id));

    if (forms.length === 0) {
        return null;
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="icon" className="h-8 w-8">
                    <Plus className="h-4 w-4"/>
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Select Assessment Form</DialogTitle>
                </DialogHeader>
                <ScrollArea className="h-[400px] pr-4">
                    <div className="grid gap-4">
                        {forms.map((form) => (
                            <Card key={form.id} className="cursor-pointer hover:border-blue-300 transition-colors"
                                  onClick={() => handleSelectTemplate(form.id)}>
                                <CardHeader>
                                    <CardTitle className="text-lg">{form.name}</CardTitle>
                                    <CardDescription>{form.description}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-wrap gap-2">
                                        {form.sections.map((section) => (
                                            <Badge key={section} variant="secondary" className="text-xs">
                                                {section}
                                            </Badge>
                                        ))}
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button variant="secondary" size="sm" className="w-full" loading={loading}>
                                        Select Form
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}